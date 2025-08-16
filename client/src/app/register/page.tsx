'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import * as z from 'zod';

import { HEADER_HEIGHT } from '@/constans';
import { RegisterSchema } from '@/validations';
import { registerUser } from '@/api/auth.api';

type FormData = z.infer<typeof RegisterSchema>;


export default function RegisterScreen() {

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(RegisterSchema),
  });
  const router = useRouter();



  const onSubmit = async (data: FormData) => {
    try {
      await registerUser(data)
      router.push('/quizzes');
    } catch(err) {
      console.log('error', err)
    }
  };

  return (
    <Stack justifyContent="center" alignItems="center" minHeight={`calc(100vh - ${HEADER_HEIGHT}px)`}>
      <Container component="main" maxWidth="sm">
      <Typography component="h1" variant="h5" textAlign='center'>
          Sign up
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
        <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Name"
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            id="password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size='large'
            sx={{ mt: 3 }}
          >
            Sign Up
          </Button>
        </Box>
        
        {/* Login guidance */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?
          </Typography>
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <Typography 
              variant="body2" 
              color="primary"
              sx={{ 
                mt: 0.5,
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              Sign in here
            </Typography>
          </Link>
        </Box>
      </Container>
    </Stack>
  )
}