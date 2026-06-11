/**
 * ============================================
 * MIS PEDIDOS PAGE - Adaptado a la paleta del proyecto
 * ============================================
 * Página para ver el historial de pedidos del cliente
 */

import React, { useEffect, useState } from 'react';
import { Container, Card, Table, Badge, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import pedidoService from '../services/pedidoService';
import LoadingSpinner from '../components/LoadingSpinner';

const MisPedidosPage = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadPedidos();
  }, [isAuthenticated, navigate]);

  const loadPedidos = async () => {
    setLoading(true);
    try {
      const response = await pedidoService.getMisPedidos();
      if (response.success) {
        setPedidos(response.data.pedidos || response.data || []);
      } else {
        setMensaje({ tipo: 'danger', texto: response.message || 'Error al cargar pedidos' });
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar los pedidos' });
    } finally {
      setLoading(false);
    }
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(precio);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      'pendiente': 'warning',
      'confirmado': 'info',
      'en_proceso': 'primary',
      'enviado': 'secondary',
      'entregado': 'success',
      'cancelado': 'danger'
    };
    return badges[estado] || 'secondary';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      'pendiente': 'Pendiente',
      'confirmado': 'Confirmado',
      'en_proceso': 'En Proceso',
      'enviado': 'Enviado',
      'entregado': 'Entregado',
      'cancelado': 'Cancelado'
    };
    return textos[estado] || estado;
  };

  if (loading) {
    return <LoadingSpinner message="Cargando pedidos..." />;
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="pedidos-title">
          <i className="bi bi-box-seam me-2"></i>
          Mis Pedidos
        </h1>
        <Button className="btn-seguir-comprando" onClick={() => navigate('/catalogo')}>
          <i className="bi bi-shop me-2"></i>
          Seguir Comprando
        </Button>
      </div>

      {mensaje.texto && (
        <Alert variant={mensaje.tipo} dismissible onClose={() => setMensaje({ tipo: '', texto: '' })}>
          {mensaje.texto}
        </Alert>
      )}

      {pedidos.length === 0 ? (
        <Card className="text-center py-5 empty-card">
          <Card.Body>
            <i className="bi bi-inbox display-1 text-muted"></i>
            <h3 className="mt-3">No tienes pedidos aún</h3>
            <p className="text-muted">Comienza a comprar para ver tu historial de pedidos aquí</p>
            <Button className="btn-ir-catalogo" onClick={() => navigate('/catalogo')}>
              <i className="bi bi-shop me-2"></i>
              Ir al Catálogo
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Card className="pedidos-card">
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0 pedidos-table">
              <thead className="pedidos-table-header">
                <tr>
                  <th>Pedido</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th className="text-end">Total</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.id}>
                    <td className="align-middle">
                      <div>
                        <strong className="pedido-id">#{pedido.id}</strong>
                        <div className="small text-muted">
                          {pedido.detalles?.length || 0} producto(s)
                        </div>
                      </div>
                    </td>
                    <td className="align-middle">
                      {formatearFecha(pedido.createdAt)}
                    </td>
                    <td className="align-middle">
                      <Badge bg={getEstadoBadge(pedido.estado)}>
                        {getEstadoTexto(pedido.estado)}
                      </Badge>
                    </td>
                    <td className="align-middle text-end">
                      <strong className="pedido-total">{formatearPrecio(pedido.total)}</strong>
                    </td>
                    <td className="align-middle text-center">
                      <Button
                        className="btn-ver-detalle"
                        size="sm"
                        onClick={() => navigate(`/pedido-confirmado/${pedido.id}`)}
                      >
                        <i className="bi bi-eye me-1"></i>
                        Ver Detalle
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Estilos personalizados usando variables globales */}
      <style jsx>{`
        .pedidos-title {
          background: linear-gradient(135deg, var(--bs-gold, #f5c271), var(--bs-gold-dark, #c7984e));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          font-weight: 700;
        }
        .btn-seguir-comprando {
          background: linear-gradient(135deg, var(--bs-gold, #f5c271), var(--bs-gold-dark, #c7984e));
          border: none;
          border-radius: 0.75rem;
          padding: 0.5rem 1.25rem;
          font-weight: 600;
          color: var(--fnt-black, #000000);
          transition: all 0.3s ease;
        }
        .btn-seguir-comprando:hover {
          background: linear-gradient(135deg, var(--bs-gold-dark, #c7984e), var(--bs-oldGold-bg, #916934));
          transform: translateY(-2px);
          box-shadow: 0 4px 15px 0 rgba(145, 105, 52, 0.3);
        }
        .empty-card, .pedidos-card {
          border-radius: 1.5rem;
          border: none;
          overflow: hidden;
          background: var(--bg, #ffffff);
          box-shadow: var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1));
        }
        .btn-ir-catalogo {
          background: linear-gradient(135deg, var(--bs-gold, #f5c271), var(--bs-gold-dark, #c7984e));
          border: none;
          border-radius: 0.75rem;
          padding: 0.5rem 1.25rem;
          font-weight: 600;
          color: var(--fnt-black, #000000);
          transition: all 0.3s ease;
        }
        .btn-ir-catalogo:hover {
          background: linear-gradient(135deg, var(--bs-gold-dark, #c7984e), var(--bs-oldGold-bg, #916934));
          transform: translateY(-2px);
        }
        .pedidos-table {
          border-radius: 1.5rem;
          overflow: hidden;
        }
        .pedidos-table-header {
          background: var(--bg-positiva, #DBE1ED);
          color: var(--bg-negativo, #192847);
          font-weight: 600;
        }
        .pedidos-table-header th {
          border-bottom: none;
          padding: 1rem;
        }
        .pedido-id {
          color: var(--bg-negativo, #192847);
        }
        .pedido-total {
          background: linear-gradient(135deg, var(--bs-gold, #f5c271), var(--bs-gold-dark, #c7984e));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          font-weight: 700;
        }
        .btn-ver-detalle {
          background: transparent;
          border: 2px solid var(--bs-gold, #f5c271);
          color: var(--bs-gold-dark, #c7984e);
          border-radius: 0.75rem;
          padding: 0.375rem 0.75rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .btn-ver-detalle:hover {
          background: var(--bs-gold, #f5c271);
          color: var(--fnt-black, #000000);
          transform: translateY(-1px);
        }
        /* Ajuste para badges de estado (Bootstrap mantiene sus colores semánticos) */
        :global(.badge.bg-warning) {
          background-color: var(--bg-aviso, #F7B517) !important;
          color: var(--fnt-black, #000000);
        }
        :global(.badge.bg-info) {
          background-color: #0dcaf0 !important;
        }
        :global(.badge.bg-primary) {
          background-color: var(--bs-oldGold-bg, #916934) !important;
        }
        :global(.badge.bg-secondary) {
          background-color: var(--gray-600, #4b5563) !important;
        }
        :global(.badge.bg-success) {
          background-color: #10b981 !important;
        }
        :global(.badge.bg-danger) {
          background-color: #ef4444 !important;
        }
      `}</style>
    </Container>
  );
};

export default MisPedidosPage;