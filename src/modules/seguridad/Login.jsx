import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Container, FormControl, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, Typography, Paper
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from '../../components/AuthContext';

function Login() {
  const { usuario } = useAuth();  // Solo para saber si ya está autenticado (opcional)
  const [esAdmin, setEsAdmin] = useState(true);
  const [inputUsuario, setInputUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (esAdmin) {
      try {
        await signInWithEmailAndPassword(auth, inputUsuario, password);
        localStorage.setItem('tipoUsuario', 'admin');
        navigate('/');
      } catch (err) {
        setError('Credenciales inválidas para administrador');
      }
    } else {
      try {
        const q = query(
          collection(db, "usuarios"),
          where("username", "==", inputUsuario),
          where("password", "==", password)
        );
        const res = await getDocs(q);
        if (!res.empty) {
          const userDoc = res.docs[0];
          const userData = userDoc.data();

          localStorage.setItem('usuario', JSON.stringify({
            nombre: userData.nombreUsuario,
            rol: userData.rol
          }));
          localStorage.setItem('tipoUsuario', 'local');

          navigate('/');
        } else {
          setError('Usuario o contraseña incorrectos');
        }
      } catch (err) {
        setError('Error al iniciar sesión');
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={6} sx={{ padding: 4, marginTop: 8 }}>
        <Typography variant="h4" gutterBottom align="center">
          Iniciar Sesión
        </Typography>
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 2 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="tipo-usuario-label">Tipo de Usuario</InputLabel>
            <Select
              labelId="tipo-usuario-label"
              value={esAdmin ? 'admin' : 'otros'}
              onChange={(e) => setEsAdmin(e.target.value === 'admin')}
              label="Tipo de Usuario"
            >
              <MenuItem value="admin">Administrador</MenuItem>
              <MenuItem value="otros">Encargado de ventas / bodega</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel htmlFor="usuario-input">
              {esAdmin ? 'Correo' : 'Nombre de usuario'}
            </InputLabel>
            <OutlinedInput
              id="usuario-input"
              type="text"
              value={inputUsuario}
              onChange={(e) => setInputUsuario(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  {esAdmin ? <EmailIcon /> : <PersonIcon />}
                </InputAdornment>
              }
              label={esAdmin ? 'Correo' : 'Nombre de usuario'}
              required
            />
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel htmlFor="password-input">Contraseña</InputLabel>
            <OutlinedInput
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              }
              label="Contraseña"
              required
            />
          </FormControl>

          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <Box display="flex" justifyContent="center" mt={3}>
            <Button type="submit" variant="contained" size="large">
              Iniciar sesión
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default Login;
