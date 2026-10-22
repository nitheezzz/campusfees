# TODO

- [x] **Public roster visibility** — Any visitor, without signing in, can open the public link and view the student fee records, including student names, roll numbers, courses, fee amounts in INR, and Paid/Pending statuses.
- [x] **Anonymous fee entries** — Any visitor, without signing in, can add a new record with student name, roll number, course, fee amount in INR, and Paid/Pending status. Entries and statuses are self-reported and do not verify that payment occurred.
- [x] **Public record management** — Any visitor, without signing in, can edit and delete existing fee records from the collected records table. Editing lets visitors change student name, roll number, course, fee amount in INR, and Paid/Pending status, then save the changes. Deleting requires confirmation. Successful changes refresh the records and fee totals.
- [x] **Collected-fees total** — Display the total amount for records marked Paid (not Pending), with the public ledger clearly identifying the figure as self-reported.
- [ ] **Public deployment** — Deploy the updated application and backend on the public internet, with the roster visible and entry submission open to visitors as described above.

- [x] **7.5 Reservation entries** — Add a “7.5 Reservation” option to the fee-entry form. Students in this category do not need to pay fees; selecting it must save the fee amount as ₹0 and the record status as “7.5 Reservation”. The new status must appear in the ledger and status filter, work when adding and editing records, and not be counted as collected or pending fees.
- [x] **Team and SPR No. fields** — Add a Team field to the student entry form and a Team column to the records table beside the student name and SPR number. Show the existing roll-number value as “SPR No.” in the form, table, and search prompt. Keep Team optional for compatibility with existing records, make it editable/searchable, and display an em dash when an existing entry has no Team.
