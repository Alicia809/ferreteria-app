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
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import IconButton from '@mui/material/IconButton';

function Login() {
  const [esAdmin, setEsAdmin] = useState(true);
  const [inputUsuario, setInputUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [advertenciaCAI, setAdvertenciaCAI] = useState('');
  const navigate = useNavigate();
  const { usuario, loginLocal } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Función para verificar resolución CAI activa y días restantes
  const verificarResolucionCAI = async () => {
    try {
      const q = query(collection(db, 'resolucionCAI'), where('activa', '==', true));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const resolucionActiva = querySnapshot.docs[0].data();
        const fechaLimiteStr = resolucionActiva.fecha_limite_emision; // ej: '2025-08-15'
        const fechaLimite = new Date(`${fechaLimiteStr}T00:00:00-06:00`);
        
        const hoy = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Tegucigalpa' }));

        const diffTiempo = fechaLimite.getTime() - hoy.getTime();
        const diffDias = Math.ceil(diffTiempo / (1000 * 60 * 60 * 24));

        if (diffDias <= 5 && diffDias >= 0) {
          setAdvertenciaCAI(`¡Atención! La resolución CAI activa vence en ${diffDias} día(s).`);
          return true; // indica que hay advertencia
        }
      }
    } catch (error) {
      console.error('Error al verificar resolución CAI:', error);
    }
    return false; // no hay advertencia
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setAdvertenciaCAI('');

    if (esAdmin) {
      try {
        await signInWithEmailAndPassword(auth, inputUsuario, password);
        localStorage.setItem('tipoUsuario', 'admin');

        const hayAdvertencia = await verificarResolucionCAI();

        if (!hayAdvertencia) {
          navigate('/');
        }
        // Si hay advertencia, se muestra el mensaje y no navega automáticamente,
        // para que el usuario pueda verla antes de avanzar.
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

          //Verificar si el usuario está activo
          if (userData.activo !== true) {
            setError('El usuario no está activo.');
            return; // no continuar con el login
          }

          const usuarioLocal = {
            nombre: userData.username,
            rol: userData.rol
          };

          localStorage.setItem('usuario', JSON.stringify(usuarioLocal));
          localStorage.setItem('tipoUsuario', 'local');

          loginLocal(usuarioLocal);

          const hayAdvertencia = await verificarResolucionCAI();

          if (!hayAdvertencia) {
            navigate('/');
          }
          // Si hay advertencia, no navega para mostrar mensaje
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

          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel htmlFor="password-input">Contraseña</InputLabel>
            <OutlinedInput
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
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

          {advertenciaCAI && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 1,
                backgroundColor: '#fff3cd',
                border: '1px solid #ffeeba',
              }}
            >
              <Typography variant="body1" color="#856404">
                {advertenciaCAI}
              </Typography>
              <Button
                variant="contained"
                size="small"
                sx={{ mt: 1 }}
                onClick={() => navigate('/')}
              >
                Continuar
              </Button>
            </Box>
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
