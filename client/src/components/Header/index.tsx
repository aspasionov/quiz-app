'use client'

import * as React from 'react';

import Image from 'next/image';
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation';

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



const authenticatedPages = ['home', 'quizzes', 'quiz-generator', 'contact'];
const unauthenticatedPages = ['home', 'login', 'contact']; // Only login since register redirects to login

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [isClient, setIsClient] = React.useState(false);
  const { user, clearUser } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();

  // Handle hydration mismatch by only using pathname on client side
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Determine which pages to show based on authentication status
  const pages = user ? authenticatedPages : unauthenticatedPages;

  // Function to get display name for navigation items
  const getPageDisplayName = (page: string) => {
    switch (page) {
      case 'home':
        return 'Home';
      case 'quiz-generator':
        return 'Quiz Generator';
      case 'quizzes':
        return 'Quizzes';
      case 'login':
        return 'Login';
      case 'contact':
        return 'Contact';
      default:
        return page.charAt(0).toUpperCase() + page.slice(1);
    }
  };

  // Function to check if a page is currently active
  const isActivePage = (page: string) => {
    if (!isClient) return false; // Prevent hydration mismatch
    if (page === 'home') {
      return pathname === '/' || pathname === '/home';
    }
    return pathname === `/${page}` || (page === 'quizzes' && pathname.startsWith('/quizzes'));
  };

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
      // Clear auth cache
      const { authManager } = await import('@/utils/authManager');
      authManager.clearAuthCache();
      router.push('/login');
      handleCloseUserMenu();
    }
  };

  // Prevent hydration mismatch by not rendering conditional styles on first render
  if (!isClient) {
    // Return a basic version without active page highlighting during SSR
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
                style={{ marginRight: '8px', cursor: 'pointer' }}
              />
            </Link>
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
                        color: 'inherit',
                        fontWeight: 'normal',
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
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                <Link key={page} href={page === 'home' ? '/' : `/${page}`} style={{ textDecoration: 'none' }}>
                  <Button
                    onClick={handleCloseNavMenu}
                    sx={{ 
                      my: 2, 
                      color: 'white', 
                      display: 'block',
                      fontWeight: 'normal',
                      position: 'relative',
                      textTransform: 'none',
                    }}
                  >
                    {getPageDisplayName(page)}
                  </Button>
                </Link>
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
                        sx={{ bgcolor: user.avatar ? 'transparent' : 'secondary.main', color: 'primary.main', borderWidth: 1, borderStyle: 'solid', borderColor: 'secondary.main' }}
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
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            />
          </Link>
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
          <Box sx={{ flexGrow: 0 }}>
            {user && (
              <>
                <Tooltip title={`${user.name} (${user.email})`}>
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar 
                      alt={user.name} 
                      src={user.avatar || undefined}
                      sx={{ bgcolor: user.avatar ? 'transparent' : 'secondary.main', color: 'primary.main', borderWidth: 1, borderStyle: 'solid', borderColor: 'secondary.main' }}
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