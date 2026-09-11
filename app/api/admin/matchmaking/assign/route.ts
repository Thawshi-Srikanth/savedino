import { POST as handleMatchmakingPOST } from "../route";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// POST /api/admin/matchmaking/assign - Alias for POST /api/admin/matchmaking
export async function POST(req: Request) {
  return handleMatchmakingPOST(req);
}
