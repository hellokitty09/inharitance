from playwright.sync_api import sync_playwright
import psycopg2
from psycopg2.extras import execute_values
from datetime import datetime
import os

# --- PostgreSQL Configuration ---
# You can set these as environment variables or replace with your values
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "eci")
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "postgres")

def get_connection():
    """Create PostgreSQL connection"""
    return psycopg2.connect(
        host=POSTGRES_HOST,
        port=POSTGRES_PORT,
        database=POSTGRES_DB,
        user=POSTGRES_USER,
        password=POSTGRES_PASSWORD
    )

def init_database(conn):
    """Create table if not exists"""
    with conn.cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS political_parties (
                id SERIAL PRIMARY KEY,
                party_name VARCHAR(500) UNIQUE NOT NULL,
                pdf_link TEXT,
                source VARCHAR(255) DEFAULT 'eci.gov.in',
                fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE INDEX IF NOT EXISTS idx_party_name ON political_parties(party_name);
        """)
        conn.commit()
    print("✅ Database table initialized")

def upsert_party(conn, party_name, pdf_link):
    """Insert or update party in PostgreSQL"""
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO political_parties (party_name, pdf_link, source, fetched_at, updated_at)
            VALUES (%s, %s, 'eci.gov.in', %s, %s)
            ON CONFLICT (party_name) 
            DO UPDATE SET 
                pdf_link = EXCLUDED.pdf_link,
                fetched_at = EXCLUDED.fetched_at,
                updated_at = EXCLUDED.updated_at;
        """, (party_name, pdf_link, datetime.utcnow(), datetime.utcnow()))
        conn.commit()

# --- Target URL ---
URL = "https://www.eci.gov.in/constitution-of-political-party"

def main():
    # Connect to PostgreSQL
    conn = get_connection()
    init_database(conn)
    
    # --- Playwright Scraper ---
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=200)
        try:
            page = browser.new_page()
            page.goto(URL, timeout=60000)

            # Wait for the list of parties to load
            page.wait_for_selector("ul.political-party-registration li", timeout=60000)
            items = page.query_selector_all("ul.political-party-registration li")
            print("Total LI items found:", len(items))

            count = 0
            for li in items:
                # Party name (always in h4)
                h4 = li.query_selector("h4")
                if not h4:
                    continue

                party_name = h4.inner_text().strip()
                if not party_name:
                    continue

                # Optional PDF link
                a = li.query_selector('a.lofb[href]')
                pdf_link = a.get_attribute("href") if a else None

                print(party_name, "->", pdf_link)

                # Upsert into PostgreSQL
                upsert_party(conn, party_name, pdf_link)
                count += 1

        finally:
            browser.close()
            conn.close()

    print(f"✅ Inserted/updated {count} parties in PostgreSQL.")

if __name__ == "__main__":
    main()
