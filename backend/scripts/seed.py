"""
Seed script — populates the database with initial data.

Usage:
    cd backend
    python scripts/seed.py

Creates default categories, initial user accounts, and sample reports
so the application has data to work with immediately after setup.
"""
import sys
import os
import uuid
from datetime import datetime, timezone, timedelta
import random

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.session import SessionLocal
from app.database.base import Base
from app.database.session import engine
from app.models import (
    User, Category, Location, Report, AIAnalysis,
    StatusHistory, ProblemCluster, Notification, AuditLog,
)
from app.core.security import hash_password

# ── Helpers ───────────────────────────────────────────────────

def uid() -> str:
    return str(uuid.uuid4())


def dt_ago(**kwargs) -> datetime:
    return datetime.now(timezone.utc) - timedelta(**kwargs)


# ── 1. Categories ─────────────────────────────────────────────

CATEGORIES = [
    ("Roads & Infrastructure", "सड़क और बुनियादी ढांचा", "roads-infrastructure", "🛣️", "#ef4444", 1),
    ("Water Supply",           "जल आपूर्ति",             "water-supply",          "💧", "#3b82f6", 2),
    ("Sanitation & Waste",     "स्वच्छता और कचरा",       "sanitation-waste",      "🗑️", "#f97316", 3),
    ("Healthcare",             "स्वास्थ्य सेवा",          "healthcare",            "🏥", "#ec4899", 4),
    ("Education",              "शिक्षा",                   "education",             "🏫", "#8b5cf6", 5),
    ("Electricity",            "बिजली",                    "electricity",           "⚡", "#eab308", 6),
    ("Public Safety",          "सार्वजनिक सुरक्षा",       "public-safety",         "🚨", "#dc2626", 7),
    ("Environment",            "पर्यावरण",                 "environment",           "🌿", "#22c55e", 8),
    ("Drainage & Flooding",    "नाली और बाढ़",             "drainage-flooding",     "🌊", "#06b6d4", 9),
    ("Public Transport",       "सार्वजनिक परिवहन",        "public-transport",      "🚌", "#6366f1", 10),
    ("Housing",                "आवास",                     "housing",               "🏠", "#a855f7", 11),
    ("Other",                  "अन्य",                    "other",                 "📋", "#6b7280", 12),
]

# ── 2. Demo cities ────────────────────────────────────────────

CITIES = [
    ("Delhi",      "Delhi",           28.6139, 77.2090),
    ("Mumbai",     "Maharashtra",     19.0760, 72.8777),
    ("Bengaluru",  "Karnataka",       12.9716, 77.5946),
    ("Jaipur",     "Rajasthan",       26.9124, 75.7873),
    ("Lucknow",    "Uttar Pradesh",   26.8467, 80.9462),
    ("Pune",       "Maharashtra",     18.5204, 73.8567),
    ("Chandigarh", "Punjab",          30.7333, 76.7794),
    ("Patna",      "Bihar",           25.5941, 85.1376),
    ("Bhopal",     "Madhya Pradesh",  23.2599, 77.4126),
    ("Ahmedabad",  "Gujarat",         23.0225, 72.5714),
]

# ── 3. Demo reports ───────────────────────────────────────────

DEMO_REPORTS = [
    # (title, description, cat_slug, city_idx, status, priority_level, severity, urgency, days_ago)
    (
        "Water contamination — no safe drinking water for 6 days",
        "Residents of Sector 14 have been without safe drinking water for 6 days. The tap water appears brown and has a foul odour. Multiple families have reported stomach issues. This is a severe public-health emergency.",
        "water-supply", 3, "VERIFIED", "CRITICAL", 9.0, 10.0, 3,
    ),
    (
        "Major road collapse near Hazratganj — vehicles at risk",
        "A large section of road near Hazratganj crossing has collapsed creating a 15-foot wide hole. Two motorcycles have already fallen causing injuries. Heavy traffic affected. Road has been blocked since yesterday.",
        "roads-infrastructure", 4, "ASSIGNED", "CRITICAL", 9.0, 9.0, 12,
    ),
    (
        "Sewage overflow outside Central Market — health hazard",
        "Sewage water has been overflowing from the main sewer line outside Central Market for 4 days. The stench is unbearable. The entire footpath is flooded with sewage water. Shops and pedestrians are severely affected.",
        "sanitation-waste", 0, "UNDER_REVIEW", "CRITICAL", 8.0, 9.0, 4,
    ),
    (
        "Street lights non-functional for 3 weeks — safety concern",
        "All 14 street lights on MG Road near the park have been non-functional for three weeks. The area is completely dark at night. Two chain-snatching incidents have occurred in the last week in this stretch.",
        "electricity", 2, "IN_PROGRESS", "HIGH", 6.0, 7.0, 21,
    ),
    (
        "Large pothole near City Mall causing accidents",
        "There is a very large pothole about 4 feet wide and 1 foot deep near the entrance of City Mall on Ring Road. Several vehicles including cars and bikes have been damaged. One person was injured last week.",
        "roads-infrastructure", 5, "REPORTED", "HIGH", 7.0, 7.0, 6,
    ),
    (
        "Open garbage dump near school — children at risk",
        "An open garbage dump has developed right next to Government Primary School. Children have to walk past rotting waste daily. Stray animals are also present. This is a health and safety hazard for school children.",
        "sanitation-waste", 7, "REPORTED", "HIGH", 7.0, 8.0, 4,
    ),
    (
        "No electricity for 18 hours daily — affecting daily life",
        "Our colony has been facing 18-hour power cuts every day for the past two weeks. The electricity board has given no explanation. Elderly patients on medical equipment are at serious risk. Food is getting spoiled daily.",
        "electricity", 8, "UNDER_REVIEW", "HIGH", 7.0, 7.0, 14,
    ),
    (
        "Drain overflow flooding residential streets",
        "The main drain on our street has been overflowing for a week. Dirty water enters homes during rain. Children cannot go to school. Multiple households are affected. Mosquito breeding increasing disease risk.",
        "drainage-flooding", 1, "RESOLVED", "MEDIUM", 5.0, 6.0, 28,
    ),
    (
        "Public toilet near bus stand non-functional",
        "The only public toilet near the main bus stand has been locked for two weeks. Hundreds of commuters especially women are facing severe difficulty. This is a basic sanitation failure in a high-footfall area.",
        "sanitation-waste", 6, "VERIFIED", "MEDIUM", 5.0, 6.0, 14,
    ),
    (
        "Park benches broken and area unsafe at night",
        "Most benches in the central park are broken and the lighting is inadequate. Several incidents of harassment have been reported after dark. Families with children avoid the park in the evening.",
        "public-safety", 3, "REPORTED", "MEDIUM", 5.0, 5.0, 7,
    ),
    (
        "Primary school building has dangerous cracks",
        "The main building of Government Primary School No 12 has developed large cracks in walls and ceiling. Parents are afraid to send children. School management has not taken any action despite repeated complaints.",
        "education", 9, "UNDER_REVIEW", "HIGH", 7.0, 8.0, 10,
    ),
    (
        "River bank erosion threatening nearby houses",
        "The river bank near our locality has been eroding rapidly after monsoon rains. At least 15 houses are now within 10 metres of the eroded bank. We fear collapse. Immediate reinforcement is needed.",
        "environment", 4, "REPORTED", "CRITICAL", 9.0, 9.0, 5,
    ),
    (
        "Bus route cancelled leaving villages without transport",
        "Route 42A connecting 6 villages to the city has been cancelled without notice 3 weeks ago. Over 2000 residents including daily-wage workers and students are stranded. No alternative transport available.",
        "public-transport", 7, "ASSIGNED", "HIGH", 6.0, 7.0, 21,
    ),
    (
        "Illegal construction blocking emergency access road",
        "An illegal construction has completely blocked the only emergency access road to our colony. Fire engines and ambulances cannot reach the area. This has been ongoing for 2 months despite police complaints.",
        "housing", 1, "VERIFIED", "CRITICAL", 9.0, 8.0, 60,
    ),
    (
        "Overhead wire broken and hanging over road — electrocution risk",
        "A high-voltage overhead wire has snapped and is hanging approximately 2 feet above the road near the market. Vehicles are passing under it. There is immediate risk of electrocution. Electricity board has not responded.",
        "electricity", 5, "REPORTED", "CRITICAL", 9.5, 10.0, 1,
    ),
    (
        "Water pipeline burst flooding main road",
        "A major water pipeline has burst on the main road creating a 3-foot deep flood. The road is completely blocked. Surrounding shops have been damaged. Water is being wasted for 24+ hours.",
        "water-supply", 0, "IN_PROGRESS", "CRITICAL", 8.5, 9.0, 2,
    ),
    (
        "Cattle on highway causing multiple accidents",
        "Stray cattle have been roaming on the national highway near town for weeks. Three accidents have been reported in 10 days including one fatality. The municipality has not taken action.",
        "public-safety", 8, "UNDER_REVIEW", "HIGH", 7.5, 8.0, 10,
    ),
    (
        "Healthcare centre out of medicines for a month",
        "The primary healthcare centre has been out of essential medicines for over a month. Patients are being turned away. Poor families who cannot afford private clinics are suffering the most.",
        "healthcare", 2, "REPORTED", "HIGH", 7.0, 7.0, 30,
    ),
    (
        "Encroachment on public park — playground destroyed",
        "A local business has illegally encroached on the children's playground in our residential area. The swings and slides have been removed. Children have nowhere to play. Complaints to municipality ignored.",
        "housing", 6, "REPORTED", "MEDIUM", 5.0, 5.0, 20,
    ),
    (
        "Manhole cover missing on busy road — serious injury risk",
        "Three manhole covers on the main market road are missing. Two cyclists have already fallen. It is extremely dangerous especially at night. Municipality was informed 2 weeks ago with no response.",
        "roads-infrastructure", 3, "UNDER_REVIEW", "HIGH", 7.0, 8.0, 14,
    ),
]


def seed_database():
    db = SessionLocal()
    print("JanDrishti AI — Seed Script")
    print("=" * 50)

    try:
        # ── Categories ────────────────────────────────────────
        print("Seeding categories…")
        cat_map: dict[str, Category] = {}
        for name, name_hi, slug, icon, color, order in CATEGORIES:
            existing = db.query(Category).filter(Category.slug == slug).first()
            if existing:
                cat_map[slug] = existing
                continue
            cat = Category(
                id=uid(), name=name, name_hi=name_hi, slug=slug,
                icon=icon, color=color, sort_order=order, is_active=True,
            )
            db.add(cat)
            cat_map[slug] = cat
        db.commit()
        print(f"  {len(cat_map)} categories ready.")

        # ── Users ─────────────────────────────────────────────
        print("Seeding users…")
        DEMO_USERS = [
            ("citizen@demo.jandrishti.in", "Priya Sharma",     "CITIZEN",    "Demo@1234", "Jaipur",     "Rajasthan"),
            ("authority@demo.jandrishti.in","Rajesh Kumar",    "AUTHORITY",  "Demo@1234", "Jaipur",     "Rajasthan"),
            ("admin@demo.jandrishti.in",   "Ananya Singh",     "SUPER_ADMIN","Demo@1234", "Delhi",      "Delhi"),
            ("amit@demo.in",               "Amit Tiwari",      "CITIZEN",    "Demo@1234", "Lucknow",    "Uttar Pradesh"),
            ("kavya@demo.in",              "Kavya Nair",       "CITIZEN",    "Demo@1234", "Delhi",      "Delhi"),
            ("meena@demo.in",              "Meena Kumari",     "CITIZEN",    "Demo@1234", "Patna",      "Bihar"),
            ("ramesh@demo.in",             "Ramesh Yadav",     "CITIZEN",    "Demo@1234", "Bhopal",     "Madhya Pradesh"),
            ("fatima@demo.in",             "Fatima Shaikh",    "CITIZEN",    "Demo@1234", "Mumbai",     "Maharashtra"),
            ("suresh@demo.gov.in",         "Suresh Patel",     "AUTHORITY",  "Demo@1234", "Ahmedabad",  "Gujarat"),
            ("sunita@demo.in",             "Sunita Verma",     "CITIZEN",    "Demo@1234", "Jaipur",     "Rajasthan"),
        ]
        user_map: dict[str, User] = {}
        for email, name, role, pwd, city, state in DEMO_USERS:
            u = db.query(User).filter(User.email == email).first()
            if not u:
                u = User(
                    id=uid(), full_name=name, email=email,
                    hashed_password=hash_password(pwd),
                    role=role, city=city, state=state,
                    is_active=True, is_verified=True,
                )
                db.add(u)
            user_map[email] = u
        db.commit()
        print(f"  {len(user_map)} users ready.")

        # ── Reports ───────────────────────────────────────────
        print("Seeding reports…")
        authority = user_map["authority@demo.jandrishti.in"]
        citizen_emails = [
            "citizen@demo.jandrishti.in", "amit@demo.in", "kavya@demo.in",
            "meena@demo.in", "ramesh@demo.in", "fatima@demo.in", "sunita@demo.in",
        ]
        created_reports: list[Report] = []

        for i, (
            title, desc, cat_slug, city_idx, status,
            priority_level, severity, urgency, days_ago
        ) in enumerate(DEMO_REPORTS):
            city, state, lat, lng = CITIES[city_idx]
            reporter_email = citizen_emails[i % len(citizen_emails)]
            reporter = user_map[reporter_email]

            created_at = dt_ago(days=days_ago, hours=random.randint(0, 12))

            # Location
            loc = Location(
                id=uid(), address=f"Demo Street {i+1}, {city}",
                city=city, state=state,
                latitude=lat + random.uniform(-0.05, 0.05),
                longitude=lng + random.uniform(-0.05, 0.05),
            )
            db.add(loc)
            db.flush()

            # Priority score
            freq = min(3.0 + i * 0.3, 9.0)
            persistence = min(2.0 + days_ago * 0.08, 9.5)
            community = min(4.0 + severity * 0.4, 9.5)
            raw = severity * 0.30 + urgency * 0.25 + freq * 0.20 + community * 0.15 + persistence * 0.10
            priority_score = round(min(raw * 10, 100), 1)

            report = Report(
                id=uid(),
                title=title,
                description=desc,
                status=status,
                priority_level=priority_level,
                priority_score=priority_score,
                category_id=cat_map[cat_slug].id,
                location_id=loc.id,
                reporter_id=reporter.id,
                support_count=random.randint(5, 89),
                view_count=random.randint(50, 500),
                is_anonymous=False,
                created_at=created_at,
                updated_at=created_at + timedelta(hours=random.randint(1, 48)),
                date_observed=created_at - timedelta(hours=random.randint(1, 24)),
            )
            db.add(report)
            db.flush()

            # AI analysis
            analysis = AIAnalysis(
                id=uid(),
                report_id=report.id,
                predicted_category=cat_map[cat_slug].name,
                category_confidence=round(random.uniform(0.78, 0.97), 3),
                severity_score=severity,
                urgency_score=urgency,
                frequency_score=round(freq, 1),
                community_impact_score=round(community, 1),
                persistence_score=round(persistence, 1),
                priority_score=priority_score,
                priority_level=priority_level,
                reasoning=(
                    f"Keyword analysis detected high-severity indicators. "
                    f"Duration and community impact elevate urgency. "
                    f"Priority level: {priority_level}. "
                    "AI analysis is advisory — please verify before action."
                ),
                model_version="jd-nlp-v1.0",
                processed_at=created_at + timedelta(seconds=2),
            )
            db.add(analysis)

            # Initial status history
            sh = StatusHistory(
                id=uid(),
                report_id=report.id,
                old_status=None,
                new_status="REPORTED",
                changed_by_id=reporter.id,
                note="Report submitted by citizen",
                created_at=created_at,
            )
            db.add(sh)

            # Additional status transitions
            if status in ("UNDER_REVIEW", "VERIFIED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"):
                sh2 = StatusHistory(
                    id=uid(),
                    report_id=report.id,
                    old_status="REPORTED",
                    new_status="UNDER_REVIEW",
                    changed_by_id=authority.id,
                    note="Report received and under review.",
                    created_at=created_at + timedelta(hours=4),
                )
                db.add(sh2)

            if status in ("VERIFIED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"):
                sh3 = StatusHistory(
                    id=uid(),
                    report_id=report.id,
                    old_status="UNDER_REVIEW",
                    new_status="VERIFIED",
                    changed_by_id=authority.id,
                    note="Field inspection completed. Issue verified.",
                    created_at=created_at + timedelta(hours=24),
                )
                db.add(sh3)

            if status in ("ASSIGNED", "IN_PROGRESS"):
                sh4 = StatusHistory(
                    id=uid(),
                    report_id=report.id,
                    old_status="VERIFIED",
                    new_status=status,
                    changed_by_id=authority.id,
                    note="Assigned to relevant department for resolution.",
                    created_at=created_at + timedelta(hours=48),
                )
                db.add(sh4)

            if status == "RESOLVED":
                sh5 = StatusHistory(
                    id=uid(),
                    report_id=report.id,
                    old_status="IN_PROGRESS",
                    new_status="RESOLVED",
                    changed_by_id=authority.id,
                    note="Issue resolved by municipal team.",
                    created_at=created_at + timedelta(days=days_ago // 2),
                )
                db.add(sh5)

            # Notification for reporter
            n = Notification(
                id=uid(),
                user_id=reporter.id,
                type="STATUS_CHANGED",
                title="Your report status was updated",
                message=f'Your report "{title[:60]}..." is now {status.replace("_", " ").title()}.',
                report_id=report.id,
                is_read=random.choice([True, False]),
                created_at=created_at + timedelta(hours=5),
            )
            db.add(n)
            created_reports.append(report)

        db.commit()
        print(f"  {len(created_reports)} reports seeded.")

        # ── Problem clusters (top 3 reports) ─────────────────
        print("Seeding problem clusters…")
        cluster_groups = [
            ("Water contamination cluster — Jaipur", created_reports[0:1], "water-supply"),
            ("Road damage cluster — Lucknow",         created_reports[1:2], "roads-infrastructure"),
            ("Garbage & sewage cluster — Delhi",      created_reports[2:3], "sanitation-waste"),
        ]

        for title, reports_in_cluster, cat_slug in cluster_groups:
            rep = reports_in_cluster[0]
            cluster = ProblemCluster(
                id=uid(),
                title=title,
                summary=(
                    f"Multiple citizens have reported this problem. "
                    f"AI similarity analysis has grouped these reports into a cluster. "
                    f"Priority: {rep.priority_level}. Location: {rep.location.city if rep.location else 'unknown'}."
                ),
                category_id=cat_map[cat_slug].id,
                location_id=rep.location_id,
                report_count=random.randint(8, 42),
                total_support=random.randint(50, 130),
                priority_score=rep.priority_score or 75,
                priority_level=rep.priority_level,
                status=rep.status,
                representative_report_id=rep.id,
            )
            db.add(cluster)
            db.flush()
            rep.cluster_id = cluster.id

        db.commit()
        print("  3 clusters seeded.")

        # ── Audit log ─────────────────────────────────────────
        log = AuditLog(
            id=uid(),
            user_id=user_map["admin@demo.jandrishti.in"].id,
            action="SEED_RUN",
            entity_type="SYSTEM",
            detail="Seed script executed successfully.",
        )
        db.add(log)
        db.commit()

        print()
        print("=" * 50)
        print("✅ Seed complete!")
        print()
        print("Seeded accounts:")
        print("  Citizen:     citizen@demo.jandrishti.in / Demo@1234")
        print("  Authority:   authority@demo.jandrishti.in / Demo@1234")
        print("  Super Admin: admin@demo.jandrishti.in / Demo@1234")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
