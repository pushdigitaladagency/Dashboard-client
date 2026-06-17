import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import MuiThemeProvider from '@/components/MuiThemeProvider';

export const metadata = {
  title: 'Dashboard',
  description: 'Employee management dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <MuiThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </MuiThemeProvider>
      </body>
    </html>
  );
}
