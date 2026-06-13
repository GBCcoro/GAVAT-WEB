/**
 * ============================================
 * PRODUCTO COMENTARIOS - Componente
 * ============================================
 * Muestra comentarios y calificaciones de un producto
 * Se integra en ProductoDetallePage
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Button, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import comentariosService from '../services/comentariosService';
import LoadingSpinner from './LoadingSpinner';
import './ProductoComentarios.css';

const ProductoComentarios = ({ productoId, onComentarioCreado }) => {
  const { isAuthenticated, user } = useAuth();
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
  // Formulario
  const [showFormulario, setShowFormulario] = useState(false);
  const [calificacion, setCalificacion] = useState(5);
  const [textoComentario, setTextoComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  
  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const cargarComentarios = useCallback(async () => {
    setLoading(true);
    try {
      const response = await comentariosService.obtenerComentariosProducto(productoId, paginaActual, 5);
      const data = response.data || response;
      
      setComentarios(data.comentarios || []);
      setTotalPaginas(data.totalPaginas || 1);
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar comentarios' });
    } finally {
      setLoading(false);
    }
  }, [productoId, paginaActual]);

  useEffect(() => {
    cargarComentarios();
  }, [cargarComentarios]);

  const handleCrearComentario = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setMensaje({ tipo: 'warning', texto: 'Debes iniciar sesión para comentar' });
      return;
    }

    if (!textoComentario.trim()) {
      setMensaje({ tipo: 'warning', texto: 'Escribe un comentario antes de enviar' });
      return;
    }

    setEnviando(true);
    try {
      await comentariosService.crearComentario(productoId, parseInt(calificacion), textoComentario);
      setMensaje({ tipo: 'success', texto: 'Comentario creado exitosamente' });
      setTextoComentario('');
      setCalificacion(5);
      setShowFormulario(false);
      cargarComentarios();
      if (onComentarioCreado) onComentarioCreado();
    } catch (error) {
      console.error('Error al crear comentario:', error);
      setMensaje({ tipo: 'danger', texto: error.message || 'Error al crear comentario' });
    } finally {
      setEnviando(false);
    }
  };

  const renderizarEstrellas = (calificacion) => {
    const estrellas = [];
    for (let i = 1; i <= 5; i++) {
      estrellas.push(
        <i key={i} className={`bi bi-star${i <= calificacion ? '-fill' : ''} star-icon`}></i>
      );
    }
    return estrellas;
  };

  if (loading) {
    return <LoadingSpinner message="Cargando comentarios..." />;
  }

  return (
    <div className="producto-comentarios-section">
      <h4 className="comentarios-title">
        <i className="bi bi-chat-left-quote me-2"></i>
        Comentarios y Reseñas ({comentarios.length})
      </h4>

      {mensaje.texto && (
        <Alert variant={mensaje.tipo} dismissible onClose={() => setMensaje({ tipo: '', texto: '' })}>
          {mensaje.texto}
        </Alert>
      )}

      {/* Botón para mostrar formulario */}
      {isAuthenticated && (
        <div className="mb-3">
          {!showFormulario ? (
            <Button 
              variant="outline-primary" 
              onClick={() => setShowFormulario(true)}
              className="btn-crear-comentario"
            >
              <i className="bi bi-pencil-square me-2"></i>
              Escribir un comentario
            </Button>
          ) : null}
        </div>
      )}

      {/* Formulario de comentario */}
      {showFormulario && isAuthenticated && (
        <div className="formulario-comentario-container">
          <Form onSubmit={handleCrearComentario}>
            <Form.Group className="mb-3">
              <Form.Label>Tu calificación</Form.Label>
              <div className="calificacion-selector">
                {[1, 2, 3, 4, 5].map(valor => (
                  <button
                    key={valor}
                    type="button"
                    className={`estrella-btn ${calificacion >= valor ? 'active' : ''}`}
                    onClick={() => setCalificacion(valor)}
                  >
                    <i className={`bi bi-star${calificacion >= valor ? '-fill' : ''}`}></i>
                  </button>
                ))}
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tu comentario</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Comparte tu experiencia con este producto..."
                value={textoComentario}
                onChange={(e) => setTextoComentario(e.target.value)}
                disabled={enviando}
                maxLength={1000}
              />
              <small className="text-muted">
                {textoComentario.length}/1000 caracteres
              </small>
            </Form.Group>

            <div className="d-flex gap-2">
              <Button 
                type="submit" 
                variant="primary"
                disabled={enviando}
              >
                {enviando ? 'Enviando...' : 'Enviar Comentario'}
              </Button>
              <Button 
                type="button" 
                variant="outline-secondary"
                onClick={() => {
                  setShowFormulario(false);
                  setTextoComentario('');
                  setCalificacion(5);
                }}
                disabled={enviando}
              >
                Cancelar
              </Button>
            </div>
          </Form>
        </div>
      )}

      {!isAuthenticated && (
        <Alert variant="info">
          <i className="bi bi-info-circle me-2"></i>
          <strong>Debes iniciar sesión</strong> para comentar productos
        </Alert>
      )}

      {/* Lista de comentarios */}
      <div className="comentarios-lista">
        {comentarios.length === 0 ? (
          <div className="alert alert-info">
            <i className="bi bi-chat-left-dots me-2"></i>
            No hay comentarios aún. ¡Sé el primero en comentar!
          </div>
        ) : (
          comentarios.map(comentario => (
            <div key={comentario.id} className="comentario-item">
              <div className="comentario-header">
                <div className="usuario-info">
                  <strong>{comentario.usuario?.nombre || 'Anónimo'}</strong>
                  <small className="text-muted ms-2">
                    {new Date(comentario.fecha).toLocaleDateString('es-CO')}
                  </small>
                </div>
                <div className="calificacion-estrellas">
                  {renderizarEstrellas(comentario.calificacion)}
                </div>
              </div>
              <p className="comentario-texto">{comentario.comentario}</p>
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="comentarios-paginacion">
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
            disabled={paginaActual === 1}
          >
            Anterior
          </Button>
          <span className="pagina-info">
            Página {paginaActual} de {totalPaginas}
          </span>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
            disabled={paginaActual === totalPaginas}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductoComentarios;
