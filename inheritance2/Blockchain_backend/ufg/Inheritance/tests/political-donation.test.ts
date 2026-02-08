import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt } from "@graphprotocol/graph-ts"
import { AdminAdded } from "../generated/schema"
import { AdminAdded as AdminAddedEvent } from "../generated/PoliticalDonation/PoliticalDonation"
import { handleAdminAdded } from "../src/political-donation"
import { createAdminAddedEvent } from "./political-donation-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#tests-structure

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let adminAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let name = "Example string value"
    let region = "Example string value"
    let newAdminAddedEvent = createAdminAddedEvent(adminAddress, name, region)
    handleAdminAdded(newAdminAddedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#write-a-unit-test

  test("AdminAdded created and stored", () => {
    assert.entityCount("AdminAdded", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "AdminAdded",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "adminAddress",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "AdminAdded",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "name",
      "Example string value"
    )
    assert.fieldEquals(
      "AdminAdded",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "region",
      "Example string value"
    )

    // More assert options:
    // https://thegraph.com/docs/en/subgraphs/developing/creating/unit-testing-framework/#asserts
  })
})
