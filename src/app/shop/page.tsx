import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ShopInterface from "./ShopInterface";

export default async function ShopPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    return <ShopInterface />;
}
