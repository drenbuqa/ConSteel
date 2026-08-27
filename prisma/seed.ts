import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Duke shtuar të dhëna shembull...");

  // ── Clients ──────────────────────────────────────────────────────────────
  const bashkia = await prisma.client.create({
    data: {
      name: "Bashkia Tiranë",
      phone: "+355 4 222 3456",
      email: "kontakt@bashkiatirane.al",
      address: "Bulevardi Dëshmorët e Kombit, Tiranë",
      notes: "Klient institucional. Pagesat bëhen çdo 30 ditë pas faturimit.",
    },
  });

  const klan = await prisma.client.create({
    data: {
      name: "Klan Konstruksion Sh.p.k",
      phone: "+355 69 123 4567",
      email: "info@klankonstruksion.al",
      address: "Rruga Kavajës, Tiranë",
      notes: "Partner i rregullt. Punojmë bashkë që nga 2021.",
    },
  });

  const rozafa = await prisma.client.create({
    data: {
      name: "Rozafa Sh.p.k",
      phone: "+355 68 987 6543",
      email: "rozafa@rozafagroup.al",
      address: "Rruga Durrësit 45, Shkodër",
    },
  });

  const arber = await prisma.client.create({
    data: {
      name: "Arbër Hoxha",
      phone: "+355 67 456 7890",
      email: null,
      address: "Lagjja Partizani, Durrës",
      notes: "Klient individual. Preferon komunikim me telefon.",
    },
  });

  const euro = await prisma.client.create({
    data: {
      name: "EuroBuild Group",
      phone: "+355 4 234 5678",
      email: "projects@eurobuild.al",
      address: "Rruga e Elbasanit, Tiranë",
    },
  });

  const silva = await prisma.client.create({
    data: {
      name: "Silva Constructions",
      phone: null,
      email: "silva@silvaconstruct.al",
      address: null,
      notes: "Klient i ri. Kontakt vetëm me email.",
    },
  });

  console.log("✅ Klientët u shtuan");

  // ── Projects ─────────────────────────────────────────────────────────────

  // 1. Large active project with full expenses
  const p1 = await prisma.project.create({
    data: {
      name: "Banesat Tiranë 2",
      location: "Bulevardi Zogu I, Tiranë",
      clientId: bashkia.id,
      startDate: new Date("2026-03-01"),
      endDate: new Date("2026-12-31"),
      status: "active",
      workers: 12,
      totalPrice: 850000,
      shpenzimeOperative: 45000,
      shpenzimeMateriali: 180000,
      shpenzimeUshqimBonuse: 12000,
      shpenzimeTransportSherbimi: 8500,
      puneShteseTotal: 15000,
      totaliShpenzimeve: 260500,
      totaliBarazimit: 589500,
      notes: "Projekt i madh banimi. 8 kate, 48 apartamente. Afati i dorëzimit është kritik.",
    },
  });

  // 2. Completed project with profit
  const p2 = await prisma.project.create({
    data: {
      name: "Magazina Klan",
      location: "Zona Industriale, Durrës",
      clientId: klan.id,
      startDate: new Date("2026-01-15"),
      endDate: new Date("2026-06-30"),
      status: "completed",
      workers: 6,
      totalPrice: 320000,
      shpenzimeOperative: 22000,
      shpenzimeMateriali: 95000,
      shpenzimeUshqimBonuse: 6500,
      shpenzimeTransportSherbimi: 4200,
      puneShteseTotal: 0,
      totaliShpenzimeve: 127700,
      totaliBarazimit: 192300,
      notes: "Magazinë industriale 1200m². Punë e kryer me sukses.",
    },
  });

  // 3. Active project, small team
  const p3 = await prisma.project.create({
    data: {
      name: "Vila Rozafa",
      location: "Rruga Teuta, Shkodër",
      clientId: rozafa.id,
      startDate: new Date("2026-05-01"),
      endDate: new Date("2026-09-30"),
      status: "active",
      workers: 4,
      totalPrice: 145000,
      shpenzimeOperative: 8000,
      shpenzimeMateriali: 52000,
      shpenzimeUshqimBonuse: 3200,
      shpenzimeTransportSherbimi: 2100,
      puneShteseTotal: 5000,
      totaliShpenzimeve: 70300,
      totaliBarazimit: 74700,
      notes: "Vilë private 2 kate me pishinë.",
    },
  });

  // 4. Pending project - not started
  const p4 = await prisma.project.create({
    data: {
      name: "Rezidenca Durrës",
      location: "Plazhi i Durrësit, Durrës",
      clientId: arber.id,
      startDate: new Date("2026-09-01"),
      endDate: new Date("2027-06-30"),
      status: "pending",
      workers: 0,
      totalPrice: 420000,
      shpenzimeOperative: 0,
      shpenzimeMateriali: 0,
      shpenzimeUshqimBonuse: 0,
      shpenzimeTransportSherbimi: 0,
      puneShteseTotal: 0,
      totaliShpenzimeve: 0,
      totaliBarazimit: 420000,
      notes: "Projekt në pritje. Kontratat në finalizim.",
    },
  });

  // 5. Active project with high expenses (low profit)
  const p5 = await prisma.project.create({
    data: {
      name: "Qendra Tregtare EuroBuild",
      location: "Rruga e Elbasanit, Tiranë",
      clientId: euro.id,
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-11-30"),
      status: "active",
      workers: 18,
      totalPrice: 1200000,
      shpenzimeOperative: 85000,
      shpenzimeMateriali: 420000,
      shpenzimeUshqimBonuse: 28000,
      shpenzimeTransportSherbimi: 15000,
      puneShteseTotal: 45000,
      totaliShpenzimeve: 593000,
      totaliBarazimit: 607000,
      notes: "Qendër tregtare 3 kate, 4500m². Projekt më i madh i vitit.",
    },
  });

  // 6. Completed project (loss scenario)
  const p6 = await prisma.project.create({
    data: {
      name: "Rikonstruksion Silva",
      location: "Lagjja 1 Maji, Tiranë",
      clientId: silva.id,
      startDate: new Date("2025-11-01"),
      endDate: new Date("2026-02-28"),
      status: "completed",
      workers: 3,
      totalPrice: 38000,
      shpenzimeOperative: 5500,
      shpenzimeMateriali: 22000,
      shpenzimeUshqimBonuse: 2000,
      shpenzimeTransportSherbimi: 1800,
      puneShteseTotal: 5500,
      totaliShpenzimeve: 36800,
      totaliBarazimit: 1200,
      notes: "Projekt i përfunduar me sukses brenda buxhetit.",
    },
  });

  console.log("✅ Projektet u shtuan");

  // ── Reports ───────────────────────────────────────────────────────────────
  await prisma.report.createMany({
    data: [
      {
        projectId: p1.id,
        date: new Date("2026-03-15"),
        title: "Raporti i parë — Fillimi i punimeve",
        content: "Punimet kanë filluar sipas planit. Themelet janë shënuar dhe ekipi është vendosur në kantier. Materialet e para kanë mbërritur. Nuk ka probleme të rëndësishme për të raportuar.",
      },
      {
        projectId: p1.id,
        date: new Date("2026-04-20"),
        title: "Raporti i dytë — Betoni i katit të parë",
        content: "Betoni i katit të parë është derdhur me sukses. Punët janë 15% të kryera. Ka vonesë 3 ditë për shkak të reshjeve të shiut gjatë javës së tretë. Plani është të kompensohen ditët e humbura.",
      },
      {
        projectId: p1.id,
        date: new Date("2026-05-30"),
        title: "Raporti i tretë — Progresi i katit të dytë",
        content: "Kati i dytë është në fazën e strukturës. Punët janë rreth 28% të kryera. Të gjitha materialet janë në dispozicion. Ekipi po punon me kapacitet të plotë. Afati aktual mbetet i realizueshëm.",
      },
      {
        projectId: p2.id,
        date: new Date("2026-02-10"),
        title: "Fillimi i punimeve — Magazina",
        content: "Punimet kanë filluar. Themelet janë gati. Struktura metalike ka mbërritur nga furnizuesi dhe do të montohet javën e ardhshme.",
      },
      {
        projectId: p2.id,
        date: new Date("2026-05-15"),
        title: "Raporti final — Dorëzimi",
        content: "Magazina është dorëzuar me sukses. Të gjitha punimet janë kryer sipas specifikimeve. Klienti ka firmosur procesverbalin e dorëzimit. Projekti është mbyllur me rezultat të shkëlqyer.",
      },
      {
        projectId: p3.id,
        date: new Date("2026-05-20"),
        title: "Fillimi i ndërtimit të vilës",
        content: "Punimet e themeleve kanë filluar. Terreni është i favorshëm. Ekipi prej 4 punëtorësh është aktiv. Pritet të fillojë struktura e katit të parë brenda dy javësh.",
      },
      {
        projectId: p5.id,
        date: new Date("2026-02-15"),
        title: "Planifikimi dhe fillimi",
        content: "Projekt me kompleksitet të lartë. Kanë filluar punimet e themelimit. 18 punëtorë janë aktiv. Koordinimi me inxhinierin mbikëqyrës po bëhet çdo të hënë.",
      },
      {
        projectId: p5.id,
        date: new Date("2026-04-10"),
        title: "Struktura — Kati i parë komplet",
        content: "Kati i parë i qendrës tregtare është komplet. Betoni i deklaruar ka kaluar testet e cilësisë. Punimet janë rreth 22% të kryera. Ritmi është i mirë.",
      },
      {
        projectId: p6.id,
        date: new Date("2025-12-01"),
        title: "Problem — Punë shtesë të paparashikuara",
        content: "Gjatë rikonstruksionit u zbuluan probleme serioze me instalimin elektrik dhe hidraulik që nuk ishin të dukshme fillimisht. Kostoja shtesë është rreth 8,500 EUR. Klienti është njoftuar.",
      },
    ],
  });

  console.log("✅ Raportet u shtuan");

  console.log("\n🎉 Të dhënat shembull u shtuan me sukses!");
  console.log(`   👥 ${6} klientë`);
  console.log(`   🏗️  ${6} projekte (2 aktive, 2 të kryera, 1 në pritje, 1 aktiv i madh)`);
  console.log(`   📋 ${9} raporte`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
