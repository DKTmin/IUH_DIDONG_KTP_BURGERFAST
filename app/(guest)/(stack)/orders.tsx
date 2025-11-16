import { useRouter } from "expo-router";
import { useEffect } from "react";

// This page was renamed to 'terms'. Keep a redirect here so old links still work.
export default function GuestOrdersRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/(guest)/(stack)/terms");
    }, [router]);

    return null;
}

