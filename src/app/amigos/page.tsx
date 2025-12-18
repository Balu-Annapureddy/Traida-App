import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AmigoHub from "./AmigoHub";

export default async function AmigosPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    return <AmigoHub />;
}
