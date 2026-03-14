import { RootProvider } from "fumadocs-ui/provider/next";
import "./global.css";
import type { ReactNode } from "react";

export const metadata = {
	title: {
		default: "Porkbun",
		template: "%s | Porkbun",
	},
	description:
		"TypeScript SDK & CLI for Porkbun — manage domains, DNS, SSL and more",
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className="flex flex-col min-h-screen">
				<RootProvider>{children}</RootProvider>
			</body>
		</html>
	);
}
