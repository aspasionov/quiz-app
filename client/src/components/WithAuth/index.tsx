'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withAuth(Component: React.ComponentType<any>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const WithAuthComponent = (props: any) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      // Replace with your actual authentication check
      const token = localStorage.getItem('token');
      if (token) {
        // You might want to validate the token with an API call here
        setIsAuthenticated(true);
      } else {
        router.push('/login'); // Redirect to login page
      }
    }, [router]);

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };

  WithAuthComponent.displayName = `WithAuth(${Component.displayName || Component.name || 'Component'})`;
  return WithAuthComponent;
}
