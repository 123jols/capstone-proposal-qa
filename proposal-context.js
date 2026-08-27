// Full text of the IT Capstone Project 1 proposal form (Capsule Proposal).
// This is fed to Claude as grounding context so answers stay scoped to
// this student's actual proposals instead of generic AI knowledge.

export const PROPOSAL_TEXT = `
IT CAPSTONE PROJECT 1 — CAPSULE PROPOSALS

Student name: Joelito Laurente
Program: BSIT (also applicable for BSCS / WADT)
School: ACLC College of Mandaue
Date: August 26, 2026

Proposals are listed in decreasing order of preference (Main = most preferred).

================================================================
MAIN PROPOSAL
================================================================
Title: Smart Student Wallet: An IoT-Based RFID Cashless Payment and Digital
Wallet Management System with Purchase Tracking and Parent Monitoring

Type of research: Systems Development, Hardware/IoT Integration
(Not Applied Research)

Contributing courses:
- ITE 6101 - Computing Fundamentals
- ITE 6102 / ITE 6104 - Computer Programming 1 & 2
- ITE 6201 - Data Structures and Algorithms
- IT 6203 - Database Management System 1 (Oracle)
- IT 6201 / IT 6223 / IT 6300 - Data Communications and Networking 1, 2, 4
- ITE 6300 - Cloud Computing and the Internet of Things
- IT 6205 / IT 6206 - Information Assurance and Security 1 & 2
- IT 6200 - Introduction to Human Computer Interaction
- IT 6208 - System Integration and Architecture 1
- CS 6209 - Software Engineering 1

Statement of the proposed question:
School students commonly use physical cash when purchasing food and other
items inside the campus. This may result in problems such as lost money,
difficulty monitoring student expenses, manual transaction recording, and
limited visibility for parents or guardians regarding their child's
purchases. Existing cashless systems may also lack features specifically
designed for school environments. Thus, this study asks:
RQ1: How can RFID and IoT technologies be integrated with a digital wallet
system to provide a secure and efficient cashless payment process for
students?
RQ2: How can purchase tracking and parent monitoring features improve the
visibility and management of student transactions?

Background:
Cashless payment systems have become increasingly common through digital
wallets, contactless cards, and RFID technology. However, many school
canteens and campus establishments still rely heavily on physical cash
transactions. Students may lose cash, while parents may have limited
information regarding how their children's allocated funds are being spent.
The proposed Smart Student Wallet system aims to provide a school-oriented
cashless payment solution using RFID cards linked to individual student
digital wallet accounts. Students can use their RFID cards to make
purchases at authorized school merchants or canteens. Each transaction is
recorded in a centralized database and updates the student's available
balance. The system will also provide purchase tracking and a parent
monitoring portal where parents or guardians can view transaction history
and wallet activity. By integrating RFID hardware, IoT-enabled transaction
devices, and a centralized web-based management system, the project aims
to create a practical prototype that improves transaction efficiency,
monitoring, and financial visibility within the school environment.

Proposed methodology:
The project will follow an Agile Software Development methodology.
Requirements will be gathered through interviews or surveys with students,
parents, school personnel, and canteen operators to identify transaction
and monitoring needs. The hardware prototype will use ESP32 microcontrollers
and RFID readers to identify student cards during transactions. A web-based
system will manage student accounts, wallet balances, transactions, and
purchase records using a centralized database. The system will include
separate interfaces for administrators, cashiers, students, and parents.
Prototype testing and User Acceptance Testing will evaluate functional
suitability, usability, transaction accuracy, and response time.

References:
1. Sommerville, I. (2015). Software Engineering (10th ed.). Pearson.
2. Kurose, J. F., & Ross, K. W. (2017). Computer Networking: A Top-Down
   Approach (7th ed.). Pearson.
3. Finkenzeller, K. (2010). RFID Handbook: Fundamentals and Applications
   in Contactless Smart Cards, Radio Frequency Identification and
   Near-Field Communication (3rd ed.). Wiley.
4. Espinosa, R. J. A., Lumibao, A. L. T., Zerrudo, C. Y. P., & Intal, G. L. D.
   (2021). Design of Cashless Payment System with RFID to Improve Services
   of School Canteen: A Case Study. Proceedings of the International
   Conference on Industrial Engineering and Operations Management.
5. Saaid, M. F., & Handani, M. N. RFID-Based Cashless Payment System.

================================================================
BACKUP PROPOSAL 1
================================================================
Title: SmartGate: An IoT-Based Smart School Entrance Screening and Access
Monitoring System with RFID Identification and Real-Time Alerts

Type of research: Systems Development, Hardware/IoT Integration

Contributing courses:
- ITE 6102 / ITE 6104 - Computer Programming 1 & 2
- IT 6201 / IT 6223 / IT 6300 - Data Communications and Networking 1, 2, 4
- ITE 6300 - Cloud Computing and the Internet of Things
- IT 6203 - Database Management System 1 (Oracle)
- IT 6205 / IT 6206 - Information Assurance and Security 1 & 2
- IT 6200 - Introduction to Human Computer Interaction
- CS 6206 - Principles of Operating Systems and its Application
- IT 6208 - System Integration and Architecture 1

Statement of the proposed question:
Monitoring individuals entering a school campus is important for security
and access management. Traditional manual checking may require personnel
to verify student or visitor identities and monitor entry records manually.
This can result in delays, incomplete records, and difficulty monitoring
access in real time. Thus, this study asks:
RQ1: How can IoT and RFID technologies be integrated to develop a smart
entrance system for identifying and monitoring authorized students and
visitors?
RQ2: How can real-time access monitoring and alerts improve the efficiency
and visibility of school entrance management?

Background:
School entrances serve as the first point of contact for students,
personnel, and visitors entering the campus. Many schools rely on manual
identification checking and logbooks to record individuals entering and
leaving the premises. These processes may be time-consuming, especially
during peak hours when large numbers of students arrive simultaneously.
The proposed SmartGate system aims to develop an IoT-based entrance
monitoring prototype that uses RFID technology for student identification
and access monitoring. Authorized students can scan their RFID-enabled
school identification cards when entering or leaving the campus. The
system records the time, identification information, and access status
in a centralized database. For visitors, the system can support a separate
registration process and temporary identification method. Administrators
can monitor entrance activity through a real-time dashboard and receive
alerts for selected events, such as unauthorized access attempts or
invalid identification. The project integrates physical IoT devices with
a web-based monitoring system to improve the efficiency of school entrance
monitoring and access record management.

Proposed methodology:
The project will use an Agile or Rapid Application Development methodology.
System requirements will be gathered from school administrators, security
personnel, students, and other potential users. The prototype will use an
ESP32 microcontroller, RFID reader, RFID cards, indicator LEDs, and
optional alert devices. A centralized web-based application will manage
student records, visitor information, access logs, and real-time
monitoring. The RFID device will communicate with the server through
Wi-Fi to update access records. The system will be evaluated through
prototype testing and User Acceptance Testing based on functional
suitability, usability, access-record accuracy, and response time.

References:
1. Finkenzeller, K. (2010). RFID Handbook (3rd ed.). Wiley.
2. Kurose, J. F., & Ross, K. W. (2017). Computer Networking: A Top-Down
   Approach (7th ed.). Pearson.
3. Sommerville, I. (2015). Software Engineering (10th ed.). Pearson.
4. Ishaq, K., & Bibi, S. (2023). IoT Based Smart Attendance System Using
   RFID: A Systematic Literature Review. arXiv:2308.02591.
5. Kumar, S., Jain, A., & Gupta, R. (2021). Low-Cost RFID Implementation
   for Educational Institution Access Control. In 2021 IEEE International
   Conference on Electronics, Computing and Communication Technologies
   (CONECCT), pp. 1-6.
6. Reddy, M. P., Peeri, A., Srinu, N., & Kumar, K. A. (2025). RFID-Based
   Attendance Monitoring System with Real-Time Notifications. International
   Journal of Innovative Science and Research Technology, 10(5), 4440-4445.

================================================================
BACKUP PROPOSAL 2
================================================================
Title: SafeGuard: An IoT-Based Smart School Safety Monitoring System with
AI-Assisted Threat Detection and Real-Time Emergency Alerts

Type of research: Systems Development, Hardware/IoT Integration

Contributing courses:
- ITE 6102 / ITE 6104 - Computer Programming 1 & 2
- IT 6201 / IT 6223 / IT 6300 - Data Communications and Networking 1, 2, 4
- COMP 6103 - Integrative Programming and Technology 1
- CS 6302 - Current Trends and Issues
- IT 6203 - Database Management System 1 (Oracle)
- IT 6205 / IT 6206 - Information Assurance and Security 1 & 2
- IT 6200 - Introduction to Human Computer Interaction

Statement of the proposed question:
Schools require effective safety monitoring systems to assist personnel in
identifying potential security concerns. Traditional CCTV systems primarily
depend on continuous human observation, which may make it difficult to
monitor multiple video feeds simultaneously. Advances in artificial
intelligence and computer vision provide opportunities for automated
analysis of camera feeds. Thus, this study asks:
RQ1: How can AI-based object detection be integrated with an IoT-enabled
monitoring system to assist in identifying selected potentially dangerous
objects from camera feeds?
RQ2: How can real-time alerts and a centralized monitoring dashboard
support faster human verification and response to potential safety events?

Background:
CCTV systems are commonly used for security monitoring; however, their
effectiveness often depends on personnel continuously observing multiple
camera feeds. Computer vision technology and object detection models such
as YOLO can analyze images or video frames and identify trained object
categories. The proposed SafeGuard system aims to develop a prototype that
combines AI-assisted object detection, camera monitoring, IoT devices, and
real-time alerts. Video input from a webcam or IP camera will be processed
by an AI model trained or configured to recognize selected potentially
dangerous object categories. When the system detects an object above a
defined confidence threshold, it records the event and sends an alert to a
monitoring dashboard. IoT devices such as ESP32-based alert modules may
activate visual or audio indicators. The system will be designed as an
AI-assisted monitoring tool, meaning that detections require human
verification and do not automatically confirm a threat or determine a
person's intent.

Proposed methodology:
The project will follow an iterative and Agile development approach.
Initial development will begin with a laptop webcam and a lightweight YOLO
object detection model. A suitable dataset will be collected or obtained
from legally usable sources, annotated, and used for training or
fine-tuning selected detection classes. The trained model will be
evaluated using measures such as precision, recall, and detection
accuracy. A web-based dashboard will record potential detection events,
confidence levels, timestamps, and camera sources. ESP32-based devices may
activate LED or buzzer alerts. The prototype will undergo controlled
testing and usability evaluation. The system's purpose is AI-assisted
detection requiring human verification, not autonomous threat confirmation.

References:
1. Redmon, J., Divvala, S., Girshick, R., & Farhadi, A. (2016). You Only
   Look Once: Unified, Real-Time Object Detection.
2. Bochkovskiy, A., Wang, C.-Y., & Liao, H.-Y. M. (2020). YOLOv4: Optimal
   Speed and Accuracy of Object Detection.
3. Sommerville, I. (2015). Software Engineering (10th ed.). Pearson.
4. Salazar González, J. L., Zaccaro, C., Álvarez-García, J. A.,
   Soria-Morillo, L. M., & Sancho Caparrini, F. (2020). Real-time gun
   detection in CCTV: An open problem. Neural Networks, 132, 297-308.
5. Thakur, A., Shrivastav, A., Sharma, R., Kumar, T., & Puri, K. (2024).
   Real-Time Weapon Detection Using YOLOv8 for Enhanced Safety.
   arXiv:2410.19862.
`.trim();

const REVIEWER_GUIDANCE = `
=== QUICK-REFERENCE COMPARISON (reviewer aid, not part of the submitted proposal) ===
| Category            | Smart Student Wallet | SmartGate     | SafeGuard                |
|----------------------|----------------------|---------------|---------------------------|
| Main technology       | RFID + IoT            | RFID + IoT     | AI (YOLO) + IoT            |
| AI/model training required | No               | No             | Yes                         |
| Hardware complexity    | Medium                | Medium          | High                        |
| Software complexity    | Medium-High            | Medium          | High                        |
| Main risk               | Transaction accuracy/security | Visitor & offline workflow | AI accuracy, dataset quality |

=== KNOWN OPEN DECISIONS (not yet finalized — say so plainly if asked) ===
Smart Student Wallet: how funds are added to the wallet; whether real payment gateways are used; exact parent-portal permissions; exact merchant features; final DB schema; offline/no-network transaction behavior; final auth/security design.
SmartGate: exact entrance-screening process; visitor registration workflow; whether the system auto-opens a physical gate or only monitors; QR as a fallback ID method; what counts as an "unauthorized access attempt".
SafeGuard: exact detection classes; dataset source/size; final YOLO model/version; number of cameras; confidence threshold; alert cooldown period; whether alerts stay local or go over network.

=== ADDITIONAL RULES ===
7. Mock Defense mode: when the user says "Mock Defense", act as the panel. Ask one difficult-but-fair question at a time grounded in the proposals above, then wait for his answer before asking the next one. Evaluate each answer, correct it if it's wrong or overclaiming, and explain why — don't just hand him the answer.
8. Challenge unsupported absolute claims if he makes them (e.g. "the AI is 100% accurate," "RFID is completely secure," "the system prevents all incidents") — explain why the claim isn't defensible and suggest more accurate phrasing a panel would accept.
9. For SafeGuard specifically, always keep in mind and remind him when relevant: it is AI-assisted, not autonomous; every detection requires human verification; a detection is not a confirmed threat; the system cannot determine a person's intent; real-world accuracy depends on lighting, camera angle, and dataset quality, so "100% accurate" is never a correct claim.
`;

export const SYSTEM_PROMPT = `You are a capstone defense assistant for a single BSIT student, Joelito Laurente (ACLC College of Mandaue), helping him prepare for his IT Capstone Project 1 proposal defense.

Ground every answer in the proposal document provided below. It contains his Main Proposal ("Smart Student Wallet") and two Backup Proposals ("SmartGate" and "SafeGuard").

Rules:
1. Assume questions are about these proposals unless the user clearly says otherwise. If a question is ambiguous about which proposal it refers to, assume the Main Proposal (Smart Student Wallet) unless context says otherwise.
2. Answer using only facts that are stated in or directly inferable from the document below. Do not invent RQs, features, hardware, statistics, or references that aren't in it.
3. You may go beyond simple lookup to help him prepare: suggest how to phrase an answer to a likely panel question, explain the reasoning behind a design choice already in the document, point out a possible weakness or gap a panel member might probe, or help him compare the three proposals — as long as it's grounded in what's actually written.
4. If asked something the document doesn't cover (e.g., a specific budget, a screen mockup, a exact database schema), say plainly that it isn't in the proposal yet and suggest what he should decide or bring to his adviser, rather than inventing an answer.
5. If asked something with no connection to these proposals or his capstone at all (e.g. general trivia, unrelated coding help), briefly note that this assistant is scoped to his capstone proposals and ask if he wants to bring the question back to the project.
6. Keep answers concise and defense-ready — this is for quick lookup and rehearsal, not essay writing. Use short paragraphs or bullet points.
${REVIEWER_GUIDANCE}
=== PROPOSAL DOCUMENT ===
${PROPOSAL_TEXT}
=== END PROPOSAL DOCUMENT ===`;
