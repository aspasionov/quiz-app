'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';
import { getPageDisplayName } from '@/utils/header';
import useUserStore from '@/stores/useUserStore';


import { authenticatedPages, unauthenticatedPages } from '@/constans';

type Props = {
  anchorElNav: null | HTMLElement;
  setAnchorElNav: React.Dispatch<React.SetStateAction<HTMLElement | null>>
}

function MenuMobile({anchorElNav, setAnchorElNav}: Props) {
  const { user } = useUserStore();
  const pages = user ? authenticatedPages : unauthenticatedPages;
  const pathname = usePathname();

 const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

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
    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {pages.map((page) => (
                <MenuItem 
                  key={page} 
                  onClick={handleCloseNavMenu}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.08)',
                    }
                  }}
                >
                  <Link href={page === 'home' ? '/' : `/${page}`} style={{ textDecoration: 'none', color: 'inherit', width: '100%', cursor: 'pointer' }}>
                    <Typography 
                      sx={{ 
                        textAlign: 'left', 
                        py: 0.5,
                        color: isActivePage(page) ? 'secondary.main' : 'inherit',
                        fontWeight: isActivePage(page) ? 'bold' : 'normal',
                        transition: 'color 0.2s ease-in-out',
                        '&:hover': {
                          color: 'secondary.main',
                        }
                      }}
                    >
                      {getPageDisplayName(page)}
                    </Typography>
                  </Link>
                </MenuItem>
              ))}
            </Menu>
          </Box>
  )
}

export default MenuMobile