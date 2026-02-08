import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  AdminAdded,
  AdminRemoved,
  DonorAdded,
  DonorRemoved,
  ElectionDeclared,
  PartyAdded,
  PartyRemoved,
  Withdrawal,
  donation
} from "../generated/PoliticalDonation/PoliticalDonation"

export function createAdminAddedEvent(
  adminAddress: Address,
  name: string,
  region: string
): AdminAdded {
  let adminAddedEvent = changetype<AdminAdded>(newMockEvent())

  adminAddedEvent.parameters = new Array()

  adminAddedEvent.parameters.push(
    new ethereum.EventParam(
      "adminAddress",
      ethereum.Value.fromAddress(adminAddress)
    )
  )
  adminAddedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )
  adminAddedEvent.parameters.push(
    new ethereum.EventParam("region", ethereum.Value.fromString(region))
  )

  return adminAddedEvent
}

export function createAdminRemovedEvent(
  adminAddress: Address,
  name: string,
  region: string
): AdminRemoved {
  let adminRemovedEvent = changetype<AdminRemoved>(newMockEvent())

  adminRemovedEvent.parameters = new Array()

  adminRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "adminAddress",
      ethereum.Value.fromAddress(adminAddress)
    )
  )
  adminRemovedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )
  adminRemovedEvent.parameters.push(
    new ethereum.EventParam("region", ethereum.Value.fromString(region))
  )

  return adminRemovedEvent
}

export function createDonorAddedEvent(donoraddress: Address): DonorAdded {
  let donorAddedEvent = changetype<DonorAdded>(newMockEvent())

  donorAddedEvent.parameters = new Array()

  donorAddedEvent.parameters.push(
    new ethereum.EventParam(
      "donoraddress",
      ethereum.Value.fromAddress(donoraddress)
    )
  )

  return donorAddedEvent
}

export function createDonorRemovedEvent(donorAddress: Address): DonorRemoved {
  let donorRemovedEvent = changetype<DonorRemoved>(newMockEvent())

  donorRemovedEvent.parameters = new Array()

  donorRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "donorAddress",
      ethereum.Value.fromAddress(donorAddress)
    )
  )

  return donorRemovedEvent
}

export function createElectionDeclaredEvent(
  from: BigInt,
  to: BigInt,
  cap: BigInt,
  region: string,
  name: string
): ElectionDeclared {
  let electionDeclaredEvent = changetype<ElectionDeclared>(newMockEvent())

  electionDeclaredEvent.parameters = new Array()

  electionDeclaredEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromUnsignedBigInt(from))
  )
  electionDeclaredEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromUnsignedBigInt(to))
  )
  electionDeclaredEvent.parameters.push(
    new ethereum.EventParam("cap", ethereum.Value.fromUnsignedBigInt(cap))
  )
  electionDeclaredEvent.parameters.push(
    new ethereum.EventParam("region", ethereum.Value.fromString(region))
  )
  electionDeclaredEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )

  return electionDeclaredEvent
}

export function createPartyAddedEvent(
  partyAddress: Address,
  name: string
): PartyAdded {
  let partyAddedEvent = changetype<PartyAdded>(newMockEvent())

  partyAddedEvent.parameters = new Array()

  partyAddedEvent.parameters.push(
    new ethereum.EventParam(
      "partyAddress",
      ethereum.Value.fromAddress(partyAddress)
    )
  )
  partyAddedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )

  return partyAddedEvent
}

export function createPartyRemovedEvent(
  partyAddress: Address,
  name: string
): PartyRemoved {
  let partyRemovedEvent = changetype<PartyRemoved>(newMockEvent())

  partyRemovedEvent.parameters = new Array()

  partyRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "partyAddress",
      ethereum.Value.fromAddress(partyAddress)
    )
  )
  partyRemovedEvent.parameters.push(
    new ethereum.EventParam("name", ethereum.Value.fromString(name))
  )

  return partyRemovedEvent
}

export function createWithdrawalEvent(
  by: string,
  amt: BigInt,
  elecId: BigInt
): Withdrawal {
  let withdrawalEvent = changetype<Withdrawal>(newMockEvent())

  withdrawalEvent.parameters = new Array()

  withdrawalEvent.parameters.push(
    new ethereum.EventParam("by", ethereum.Value.fromString(by))
  )
  withdrawalEvent.parameters.push(
    new ethereum.EventParam("amt", ethereum.Value.fromUnsignedBigInt(amt))
  )
  withdrawalEvent.parameters.push(
    new ethereum.EventParam("elecId", ethereum.Value.fromUnsignedBigInt(elecId))
  )

  return withdrawalEvent
}

export function createdonationEvent(
  from: string,
  to: string,
  time: BigInt,
  amt: BigInt
): donation {
  let donationEvent = changetype<donation>(newMockEvent())

  donationEvent.parameters = new Array()

  donationEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromString(from))
  )
  donationEvent.parameters.push(
    new ethereum.EventParam("to", ethereum.Value.fromString(to))
  )
  donationEvent.parameters.push(
    new ethereum.EventParam("time", ethereum.Value.fromUnsignedBigInt(time))
  )
  donationEvent.parameters.push(
    new ethereum.EventParam("amt", ethereum.Value.fromUnsignedBigInt(amt))
  )

  return donationEvent
}
