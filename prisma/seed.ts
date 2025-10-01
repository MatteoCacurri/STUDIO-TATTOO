// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.artist.createMany({
    data: [
      {
        name: "CRISTIANO",
        bio: "Specializzato in linee pulite, blackwork e fine line.",
        avatarUrl: "/artists/cristiano.jpg", // metti il percorso all’immagine
      },
      {
        name: "SDRAINS",
        bio: "Specializzato in realistico e colori vibranti.",
        avatarUrl: "/artists/sdrains.jpg", // idem
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
