```sql
-- =====================================
-- QUANTUM QSECURE COMPLETE SEED DATA
-- =====================================

-- =================
-- VENDORS
-- =================

INSERT INTO vendors (
  name,
  category,
  trust_score,
  quantum_risk_score,
  status,
  certification_level,
  headquarters,
  website,
  description,
  cert_valid
)
VALUES

('CipherShield Labs','Network Security',92,12,'active','platinum','San Francisco, CA','https://ciphershield.io','Next-gen network perimeter defense with quantum-safe tunneling.',true),

('ProtonArmor','Network Security',68,55,'active','bronze','Denver, CO','https://protonarmor.io','Lightweight network monitoring for SMB environments.',true),

('FortiQuantum','Network Security',85,18,'active','gold','Sunnyvale, CA','https://fortiquantum.io','Hardware-accelerated firewall with post-quantum IKEv3 support.',true),

('ZeroWire Security','Network Security',89,10,'active','platinum','Toronto, Canada','https://zerowire.io','Zero-trust network overlay with lattice-based encryption fabric.',true),

('SecureNexus','Identity & Access',75,34,'active','silver','New York, NY','https://securenexus.io','Zero-trust identity fabric for enterprise environments.',true),

('HorizonTrust','Identity & Access',94,6,'active','platinum','Raleigh, NC','https://horizontrust.io','Federated identity and SSO with post-quantum crypto.',true),

('Authentikey','Identity & Access',82,22,'active','gold','Amsterdam, NL','https://authentikey.eu','Hardware-backed FIDO2 passkey management.',true),

('PrismAuth','Identity & Access',88,14,'active','gold','Stockholm, Sweden','https://prismauth.se','Decentralized identity verification.',true),

('AegisProtocol','Endpoint Protection',83,22,'active','gold','Seattle, WA','https://aegisprotocol.com','AI-driven endpoint detection and response platform.',true),

('SentinelCore','Endpoint Protection',86,19,'active','gold','Miami, FL','https://sentinelcore.io','Enterprise-grade EDR with behavioral baselining.',true),

('NanoGuard Systems','Endpoint Protection',90,9,'active','platinum','Helsinki, Finland','https://nanoguard.fi','Micro-kernel isolation for endpoint sandboxing.',true),

('ApexEDR','Endpoint Protection',78,30,'active','silver','Dublin, Ireland','https://apexedr.ie','Cloud-native EDR with memory forensics.',true),

('QuantumGuard Inc.','Cloud Security',88,8,'active','gold','Austin, TX','https://quantumguard.com','Post-quantum cloud infrastructure protection.',true),

('EncryptFlow','Cloud Security',72,48,'active','silver','Portland, OR','https://encryptflow.com','Encryption-as-a-service for multi-cloud.',false),

('CloudVault Security','Cloud Security',95,5,'active','platinum','Zurich, Switzerland','https://cloudvault.ch','Sovereign cloud security with HSM-backed vaults.',true),

('NimbusShield','Cloud Security',76,37,'active','silver','Singapore','https://nimbusshield.sg','Cloud security posture management platform.',true),

('SkyArmor','Cloud Security',81,25,'active','gold','Seoul, South Korea','https://skyarmor.kr','Container runtime security with eBPF detection.',true),

('VaultMatrix','Compliance',91,15,'active','platinum','Chicago, IL','https://vaultmatrix.com','Automated compliance management platform.',true),

('PulseSecure Systems','Compliance',77,38,'active','silver','Atlanta, GA','https://pulsesecure.net','Real-time compliance posture management.',true),

('RegShield','Compliance',84,20,'active','gold','Washington, DC','https://regshield.gov.io','FedRAMP and CMMC compliance automation.',true),

('ComplianceForge','Compliance',93,8,'active','platinum','Vienna, Austria','https://complianceforge.at','Continuous compliance orchestration.',true),

('NeuralDefense AI','Threat Intel',79,41,'active','silver','Boston, MA','https://neuraldefense.ai','AI-powered threat intelligence platform.',false),

('DarkMatter Defense','Threat Intel',61,67,'under-review','bronze','Las Vegas, NV','https://darkmatterdef.com','Dark web intelligence monitoring.',false),

('PhoenixIntel','Threat Intel',87,16,'active','gold','Tel Aviv, Israel','https://phoenixintel.io','Nation-state threat actor tracking.',true),

('QuantumThreat Labs','Threat Intel',73,44,'active','silver','Melbourne, Australia','https://qtlabs.com.au','Quantum threat research and advisory.',true),

('ShadowTrace','Threat Intel',80,28,'active','gold','Berlin, Germany','https://shadowtrace.de','APT campaign correlation engine.',true)

ON CONFLICT DO NOTHING;


-- =================
-- THREATS
-- =================

INSERT INTO threats (
  vendor_id,
  title,
  severity,
  category,
  description,
  status,
  detected_at
)
VALUES

(5,'Anomalous API Call Patterns','high','API Abuse','Burst of unauthenticated API calls detected.','investigating',NOW() - INTERVAL '2 days'),

(22,'Dark Web Credential Exposure','critical','Data Breach','Admin credentials found on dark web marketplace.','open',NOW() - INTERVAL '1 day'),

(6,'Stale Session Token Exploitation','medium','Authentication','Session tokens not expiring correctly.','open',NOW() - INTERVAL '5 days'),

(13,'Weak Encryption Protocol Detected','high','Cryptography','TLS 1.0 still enabled on legacy endpoints.','open',NOW() - INTERVAL '3 days'),

(2,'Port Scan Detected','low','Reconnaissance','Sequential port scans detected against DMZ nodes.','resolved',NOW() - INTERVAL '7 days'),

(1,'Quantum Key Rotation Overdue','medium','Key Management','Post-quantum key rotation schedule missed.','open',NOW() - INTERVAL '4 days'),

(15,'Suspicious Certificate Authority','high','PKI','Certificate issued by untrusted intermediate CA.','investigating',NOW() - INTERVAL '1 day'),

(NULL,'Zero-Day Advisory: Log4Shell Variant','critical','Vulnerability','New Log4j variant affecting JVM services.','open',NOW() - INTERVAL '6 hours'),

(9,'Lateral Movement Pattern','high','Intrusion','SMB relay attack detected between internal nodes.','open',NOW() - INTERVAL '12 hours'),

(18,'Compliance Drift: SOC2','medium','Compliance','Access review controls overdue.','open',NOW() - INTERVAL '8 days'),

(11,'Unsigned Kernel Driver Loaded','critical','Endpoint','Possible rootkit detected on endpoint fleet.','investigating',NOW() - INTERVAL '3 hours'),

(4,'Brute Force Against Admin Panel','high','Authentication','14,000 failed login attempts detected.','open',NOW() - INTERVAL '18 hours'),

(24,'Supply Chain Indicator Flagged','critical','Supply Chain','Known C2 domain identified in supply chain telemetry.','open',NOW() - INTERVAL '9 hours'),

(16,'Misconfigured S3 Bucket','medium','Cloud Exposure','Publicly readable S3 bucket discovered.','resolved',NOW() - INTERVAL '6 days'),

(20,'FedRAMP Control Gap Identified','medium','Compliance','Missing penetration test evidence for controls.','open',NOW() - INTERVAL '10 days')

ON CONFLICT DO NOTHING;
```
