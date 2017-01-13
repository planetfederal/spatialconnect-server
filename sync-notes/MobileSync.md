# Mobile Synchronization #

## What Is Distributed

Single vs Distributed Image

## Definitions ##
* Append Only - always add to the end of the log. Replay the log to get the current state. Databases do this before writing to the tables.
* Update In Place - Overwrite the data. No ability to undo the operation. Databases do this. 
* Strong Consistency - All the data is up to date
* Eventual Consistency - All the data is eventually up to date. It has an infinite amount of time to become up to date.
* Commutative - a + b = b + a, a x b = b x a
* Associative - a x (b x c) = (a x b) x c
* Exactly once delivery - Once and no more than once. Impossible for partitioned data. Who acknowledges the acknowledgement?
* At most once - fire and forget
* At least once - retry if failed
* Causality - Maintaining order
* Vector Clock - an algorithm that generates ordering of events.
* Idempotent - Operation being applied multiple times does not change the result. Identity function is idempotent.

## CRDT ##
Conflict Free Replicated Data Type. Crazy things can still happen but the data type/message must have the de-conflicting mechanism built into/aided by it.

###Operation based CRDT
#### oCRDT Image ####

* All concurrent operations must be commutative
* Requires exactly-once delivery semantics
* Require causality
* Responsibility is on the infrastructure to deliver messages in the appropriate order. 
 
### State Based CRDT ###
Apply an operation locally, update your state and send the updated state over the network. 

* Allows retransmission
* Merge is idempotent. 
* In order delivery is not assumed.
* Responsibility is on the merge function to maintain consistent state. 
* Merge function must be commutative and associative

#### sCRDT Image ####


## Mobile ##

* Poor network
* Data must be available offline
* All replicas should automatically converge to the same state
* No user input should be lost

## JSON CRDT ##

JSON Consists of a Map and  List


