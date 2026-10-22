# TODO

- [x] **Private staff authentication and access control** — Provide secure staff sign-in and sign-out using real authentication. Restrict every student fee record and every management action to approved staff; unauthorized and signed-out visitors must not access the records or operations.
- [x] **Persistent student fee record workflow** — Adapt the supplied `pasted_content.txt` HTML into the working application while preserving its student name, roll number, course, fee amount in INR, and Paid/Pending status fields. Validate required fields and fee amounts when adding a record; support editing and safeguarded deletion; show the persistent record list after reloads.
- [x] **Collected-fees total** — Display the total amount collected, calculated from records marked Paid (not Pending).
- [ ] **Public deployment** — Deploy the completed application, including its backend, on the public internet while keeping student records protected by staff authentication and authorization.
