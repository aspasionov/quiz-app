import * as React from 'react';

import Image from 'next/image';
import Link from 'next/link'

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import { HEADER_HEIGHT } from '@/constans';

import UserMenu from '@/components/UserMenu';
import MainMenu from '@/components/MainMenu';

function ResponsiveAppBar() {

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        height: HEADER_HEIGHT,
        top: 0,
        zIndex: 1100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image
              src="/logo.svg"
              alt="logo"
              width={40}
              height={40}
              style={{ 
                marginRight: '8px', 
                cursor: 'pointer',
                transition: 'opacity 0.2s ease-in-out',
              }}
            />
          </Link>
          <MainMenu/>
          <Box sx={{ flexGrow: 0 }}>
            <UserMenu/>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;