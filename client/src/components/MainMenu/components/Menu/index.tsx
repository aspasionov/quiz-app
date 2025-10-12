'use client'

import React from 'react';

import { usePathname } from 'next/navigation';
import Link from 'next/link'
import Button from '@mui/material/Button';
import Box from '@mui/material/Box'
import { unauthenticatedPages, authenticatedPages } from '@/constans';
import { getPageDisplayName } from '@/utils/header';

import useUserStore from '@/stores/useUserStore';

type Props = {
  setAnchorElNav: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
}
function Menu({setAnchorElNav}: Props) {
  const { user } = useUserStore();

  const pages = user ? authenticatedPages : unauthenticatedPages;
  const pathname = usePathname();

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const isActivePage = (page: string) => {
    if (page === 'home') {
      return pathname === '/' || pathname === '/home';
    }
    return pathname === `/${page}` || (page === 'quizzes' && pathname.startsWith('/quizzes'));
  };

  return (
    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Link key={page} href={page === 'home' ? '/' : `/${page}`} style={{ textDecoration: 'none', cursor: 'pointer' }}>
                <Button
                  onClick={handleCloseNavMenu}
                  sx={{ 
                    my: 2, 
                    color: isActivePage(page) ? 'secondary.main' : 'white', 
                    display: 'block',
                    fontWeight: isActivePage(page) ? 'bold' : 'normal',
                    position: 'relative',
                    textTransform: 'none',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease-in-out',
                    '&:hover': {
                      color: 'secondary.main',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    },
                    '&::after': isActivePage(page) ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '80%',
                      height: '2px',
                      backgroundColor: 'secondary.main',
                      borderRadius: '1px'
                    } : {}
                  }}
                >
                  {getPageDisplayName(page)}
                </Button>
              </Link>
            ))}
          </Box>
  )
}

export default Menu