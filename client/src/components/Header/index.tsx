'use client'

import * as React from 'react';

import Image from 'next/image';
import Link from 'next/link'
import { useRouter } from 'next/navigation';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import LogoutIcon from '@mui/icons-material/Logout';
import { HEADER_HEIGHT } from '@/constans';
import useUserStore from '@/stores/useUserStore';
import { authApi } from '@/utils/api';



const authenticatedPages = ['quizzes', 'about'];
const unauthenticatedPages = ['login', 'register', 'about'];

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const { user, clearUser } = useUserStore();
  const router = useRouter();

  // Determine which pages to show based on authentication status
  const pages = user ? authenticatedPages : unauthenticatedPages;

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };
  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    try {
      // Call the server logout endpoint
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with client-side logout even if server call fails
    } finally {
      // Always perform client-side cleanup
      clearUser();
      router.push('/login');
      handleCloseUserMenu();
    }
  };

  return (
    <AppBar position="static" sx={{ height: HEADER_HEIGHT }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Image
            src="/logo.svg"
            alt="logo"
            width={40}
            height={40}
            style={{ marginRight: '8px' }}
          />
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
                <MenuItem key={page} onClick={handleCloseNavMenu}>
                  <Link href={`/${page}`}>
                    <Typography sx={{ textAlign: 'center' }}>{page}</Typography>
                  </Link>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                <Link href={`/${page}`} className='inherit-link'>
                  {page}
                </Link>
              </Button>
            ))}
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            {user && (
              <>
                <Tooltip title={`${user.name} (${user.email})`}>
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar 
                      alt={user.name} 
                      src={user.avatar || undefined}
                      sx={{ bgcolor: user.avatar ? 'transparent' : 'secondary.main', color: 'primary.main' }}
                    >
                      {!user.avatar && user.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
                <Menu
                  sx={{ mt: '45px', minWidth: '200px' }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;