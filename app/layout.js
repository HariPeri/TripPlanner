import './globals.css'

export const metadata = {
  title: 'Travel Planner',
  description: 'Plan your perfect trip',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}