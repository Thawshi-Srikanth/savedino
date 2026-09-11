import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        title: true,
        description: true,
      },
    });

    if (event) {
      return {
        title: `${event.title} | Asteroid Search Campaign`,
        description:
          event.description ||
          `Participate in ${event.title} on SaveDino. Analyze Pan-STARRS sky survey datasets and spot moving candidate asteroids.`,
        openGraph: {
          title: `${event.title} | SaveDino Asteroid Search`,
          description:
            event.description ||
            `Analyze telescope survey datasets and discover new asteroids in ${event.title}.`,
          url: `/campaigns/${id}`,
          images: ["/opengraph-image.png"],
        },
      };
    }
  } catch (e) {
    // Fallback if db is unavailable
  }

  return {
    title: "Asteroid Search Campaign Workspace | SaveDino",
    description:
      "Inspect sky survey image sets and coordinate asteroid discovery measurements with your squad on SaveDino.",
    openGraph: {
      title: "Asteroid Search Campaign Workspace | SaveDino",
      description: "Inspect sky survey datasets and report asteroid candidates.",
      url: `/campaigns/${id}`,
      images: ["/opengraph-image.png"],
    },
  };
}

export default function CampaignDetailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
