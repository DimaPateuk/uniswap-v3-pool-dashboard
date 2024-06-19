import './global.css';
import Providers from './providers';
export const metadata = {
  title: 'Welcome to uniswap-v3-pool-dashboard',
  description: 'Generated by create-nx-workspace',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
