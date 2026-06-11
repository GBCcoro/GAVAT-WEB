/**
 * ============================================
 * ADMIN DASHBOARD PAGE
 * ============================================
 * Panel principal de administración
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AdminDashboardPage = () => {
  const { isAdmin, isAuxiliar } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    categorias: 0,
    subcategorias: 0,
    productos: 0,
    usuarios: 0,
    pedidos: 0,
    pedidosPendientes: 0
  });

  const loadStats = useCallback(async () => {
    try {
      // Obtener estadísticas básicas
      const [categorias, subcategorias, productos, usuarios, pedidos] = await Promise.all([
        api.get('/admin/categorias'),
        api.get('/admin/subcategorias'),
        api.get('/admin/productos'),
        api.get('/admin/usuarios'),
        api.get('/admin/pedidos')
      ]);

      // Extraer los datos de cada respuesta
      const categoriasData = categorias.data?.data?.categorias || categorias.data?.categorias || categorias.data?.data || [];
      const subcategoriasData = subcategorias.data?.data?.subcategorias || subcategorias.data?.subcategorias || subcategorias.data?.data || [];
      const productosData = productos.data?.data?.productos || productos.data?.productos || productos.data?.data || [];
      const usuariosData = usuarios.data.data?.usuarios || usuarios.data.usuarios || [];
      const pedidosData = pedidos.data.data?.pedidos || pedidos.data.pedidos || [];
      
      const pedidosPendientes = Array.isArray(pedidosData) 
        ? pedidosData.filter(p => p.estado === 'pendiente').length 
        : 0;

      setStats({
        categorias: Array.isArray(categoriasData) ? categoriasData.length : 0,
        subcategorias: Array.isArray(subcategoriasData) ? subcategoriasData.length : 0,
        productos: Array.isArray(productosData) ? productosData.length : 0,
        usuarios: usuariosData.length || 0,
        pedidos: pedidosData.length || 0,
        pedidosPendientes: pedidosPendientes
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }, []);

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dashboardCards = [
    {
      title: 'Categorías',
      value: stats.categorias,
      icon: 'bi-folder',
      color: 'primary',
      link: '/admin/categorias',
      show: true
    },
    {
      title: 'Subcategorías',
      value: stats.subcategorias,
      icon: 'bi-folder2',
      color: 'info',
      link: '/admin/subcategorias',
      show: true
    },
    {
      title: 'Productos',
      value: stats.productos,
      icon: 'bi-box-seam',
      color: 'success',
      link: '/admin/productos',
      show: true
    },
    {
      title: 'Usuarios',
      value: stats.usuarios,
      icon: 'bi-people',
      color: 'warning',
      link: '/admin/usuarios',
      show: isAdmin
    },
    {
      title: 'Pedidos',
      value: stats.pedidos,
      icon: 'bi-cart-check',
      color: 'secondary',
      link: '/admin/pedidos',
      show: true
    },
    {
      title: 'Pendientes',
      value: stats.pedidosPendientes,
      icon: 'bi-clock-history',
      color: 'danger',
      link: '/admin/pedidos?estado=pendiente',
      show: true
    }
  ];

  return (
    <div className="admin-dashboard-page">
      <div className="page-header">
        <h1 className="page-title">
          <i className="bi bi-speedometer2 page-title-icon"></i>
          Panel de Administración
        </h1>
        <p className="page-subtitle text-muted">
          Bienvenido al sistema de gestión del e-commerce
        </p>
      </div>

      <div className="dashboard-grid">
        {dashboardCards.filter(card => card.show).map((card, index) => (
          <div key={index} className="dashboard-card" onClick={() => navigate(card.link)}>
            <div className={`dashboard-card-top dashboard-card-${card.color}`}>
              <div>
                <h6>{card.title}</h6>
                <h2>{card.value}</h2>
              </div>
              <div className="dashboard-card-icon">
                <i className={`${card.icon} fs-1`}></i>
              </div>
            </div>
            <div className="dashboard-card-footer">
              <span>Ver detalles</span>
              <i className="bi bi-arrow-right"></i>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-dashboard-grid">
        <div className="admin-panel">
          <div className="admin-panel-header admin-panel-header-dark">
            <h5>
              <i className="bi bi-lightning-fill"></i>
              Accesos Rápidos
            </h5>
          </div>
          <div className="admin-panel-body">
            <div className="button-grid">
              <button type="button" className="btn btn-dark btn-lg" onClick={() => navigate('/admin/productos')}>
                <i className="bi bi-plus-circle"></i>
                Agregar Producto
              </button>
              <button type="button" className="btn btn-dark btn-lg" onClick={() => navigate('/admin/categorias')}>
                <i className="bi bi-plus-circle"></i>
                Agregar Categoría
              </button>
              <button type="button" className="btn btn-dark btn-lg" onClick={() => navigate('/admin/pedidos')}>
                <i className="bi bi-list-check"></i>
                Gestionar Pedidos
              </button>
              <button type="button" className="btn btn-dark btn-lg" onClick={() => navigate('/catalogo')}>
                <i className="bi bi-shop"></i>
                Visitar Tienda
              </button>
            </div>
          </div>
        </div>

        <div className="admin-panel">
          <div className="admin-panel-header">
            <h5>
              <i className="bi bi-info-circle"></i>
              Información del Sistema
            </h5>
          </div>
          <div className="admin-panel-body">
            <ul className="info-list">
              <li>
                <i className="bi bi-check-circle text-success"></i>
                Sistema operativo correctamente
              </li>
              <li>
                <i className="bi bi-database text-primary"></i>
                Base de datos conectada
              </li>
              <li>
                <i className="bi bi-shield-check text-info"></i>
                Sesión de administrador activa
              </li>
              <li>
                <i className="bi bi-clock text-secondary"></i>
                Última actualización: {new Date().toLocaleDateString('es-CO')}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
