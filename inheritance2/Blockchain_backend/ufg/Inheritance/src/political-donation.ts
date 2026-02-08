import {
  AdminAdded as AdminAddedEvent,
  AdminRemoved as AdminRemovedEvent,
  DonorAdded as DonorAddedEvent,
  DonorRemoved as DonorRemovedEvent,
  ElectionDeclared as ElectionDeclaredEvent,
  PartyAdded as PartyAddedEvent,
  PartyRemoved as PartyRemovedEvent,
  Withdrawal as WithdrawalEvent,
  donation as donationEvent
} from "../generated/PoliticalDonation/PoliticalDonation"
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
} from "../generated/schema"

export function handleAdminAdded(event: AdminAddedEvent): void {
  let entity = new AdminAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.adminAddress = event.params.adminAddress
  entity.name = event.params.name
  entity.region = event.params.region

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleAdminRemoved(event: AdminRemovedEvent): void {
  let entity = new AdminRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.adminAddress = event.params.adminAddress
  entity.name = event.params.name
  entity.region = event.params.region

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDonorAdded(event: DonorAddedEvent): void {
  let entity = new DonorAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.donoraddress = event.params.donoraddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleDonorRemoved(event: DonorRemovedEvent): void {
  let entity = new DonorRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.donorAddress = event.params.donorAddress

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleElectionDeclared(event: ElectionDeclaredEvent): void {
  let entity = new ElectionDeclared(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.cap = event.params.cap
  entity.region = event.params.region
  entity.name = event.params.name

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePartyAdded(event: PartyAddedEvent): void {
  let entity = new PartyAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.partyAddress = event.params.partyAddress
  entity.name = event.params.name

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePartyRemoved(event: PartyRemovedEvent): void {
  let entity = new PartyRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.partyAddress = event.params.partyAddress
  entity.name = event.params.name

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleWithdrawal(event: WithdrawalEvent): void {
  let entity = new Withdrawal(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.by = event.params.by
  entity.amt = event.params.amt
  entity.elecId = event.params.elecId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handledonation(event: donationEvent): void {
  let entity = new donation(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.to = event.params.to
  entity.time = event.params.time
  entity.amt = event.params.amt

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
