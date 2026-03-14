import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEventsData, saveEvent, deleteEvent } from '../Features/EventSlice';
import AdminSidebar from '../Components/Admin/AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Loader2, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import './CategoryList.css'; 

const EventList = () => {
    const dispatch = useDispatch();
    const { events, categories, loading } = useSelector((state) => state.events);
    
    const [modal, setModal] = useState({ open: false, type: 'add', data: null });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        date: '',
        location: '',
        guests: '',
        tag: 'Classic',
        images: [null, null, null, null, null]
    });
    const [imagePreviews, setImagePreviews] = useState([null, null, null, null, null]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        dispatch(fetchEventsData());
    }, [dispatch]);

    // Cleanup previews on unmount or modal close
    useEffect(() => {
        return () => {
            imagePreviews.forEach(preview => {
                if (preview && preview.startsWith('blob:')) {
                    URL.revokeObjectURL(preview);
                }
            });
        };
    }, [imagePreviews]);

    const handleOpenModal = (type, data = null) => {
        setModal({ open: true, type, data });
        if (data) {
            setFormData({
                title: data.title,
                category: data.category || '',
                description: data.description,
                date: data.date,
                location: data.location,
                guests: data.guests,
                tag: data.tag || 'Classic',
                images: data.images // These are URLs initially
            });
            setImagePreviews(data.images);
        } else {
            setFormData({
                title: '',
                category: categories.length > 0 ? categories[0].categoryName : '',
                description: '',
                date: '',
                location: '',
                guests: '',
                tag: 'Classic',
                images: [null, null, null, null, null]
            });
            setImagePreviews([null, null, null, null, null]);
        }
    };

    const handleCloseModal = () => {
        setModal({ open: false, type: 'add', data: null });
        // Revoke any blob URLs
        imagePreviews.forEach(preview => {
            if (preview && preview.startsWith('blob:')) {
                URL.revokeObjectURL(preview);
            }
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (index, file) => {
        if (!file) return;

        const newImages = [...formData.images];
        newImages[index] = file;
        setFormData(prev => ({ ...prev, images: newImages }));

        // Create preview
        const reader = new FileReader();
        const newPreviews = [...imagePreviews];
        
        // Revoke old blob if it exists
        if (newPreviews[index] && newPreviews[index].startsWith('blob:')) {
            URL.revokeObjectURL(newPreviews[index]);
        }

        const previewUrl = URL.createObjectURL(file);
        newPreviews[index] = previewUrl;
        setImagePreviews(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if we have 5 images (either files or existing URLs)
        const totalImages = formData.images.filter(img => img !== null).length;
        if (totalImages < 5) {
            alert('Please provide all 5 images');
            return;
        }

        if (!formData.category) {
            alert('Please select a category');
            return;
        }

        setSubmitting(true);
        try {
            const form = new FormData();
            form.append('title', formData.title);
            form.append('category', formData.category);
            form.append('description', formData.description);
            form.append('date', formData.date);
            form.append('location', formData.location);
            form.append('guests', formData.guests);
            form.append('tag', formData.tag);

            // Existing images (URLs) that were not replaced
            const existingImages = formData.images.filter(img => typeof img === 'string');
            form.append('images', JSON.stringify(existingImages));

            // New images (Files)
            formData.images.forEach((img) => {
                if (img instanceof File) {
                    form.append('images', img);
                }
            });

            const result = await dispatch(saveEvent({ 
                type: modal.type, 
                data: form, 
                id: modal.data?._id 
            })).unwrap();
            handleCloseModal();
        } catch (error) {
            alert(error || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        dispatch(deleteEvent(id));
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />

            <main className="admin-main">
                <div className="category-list-container">
                    <div className="category-header">
                        <div className="header-title">
                            <h1>Events Management</h1>
                            <p>Create and manage dynamic events for your platform.</p>
                        </div>
                        <button className="add-category-btn" onClick={() => handleOpenModal('add')}>
                            <Plus size={20} /> Add Event
                        </button>
                    </div>

                    <div className="table-container">
                        {loading ? (
                            <div className="loading-spinner">
                                <Loader2 className="animate-spin" size={48} />
                            </div>
                        ) : (
                            <>
                                <table className="categories-table">
                                    <thead>
                                        <tr>
                                            <th>Image</th>
                                            <th>Title</th>
                                            <th>Category</th>
                                            <th>Date</th>
                                            <th>Location</th>
                                            <th style={{ textAlign: 'center' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <AnimatePresence mode="popLayout">
                                            {events.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((event) => (
                                                <motion.tr
                                                    key={event._id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    layout
                                                >
                                                    <td>
                                                        <img
                                                            src={(event.images && event.images[0]) || 'https://placehold.co/50'}
                                                            alt={event.title}
                                                            style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover' }}
                                                        />
                                                    </td>
                                                    <td className="category-name-cell">
                                                        {event.title}
                                                    </td>
                                                    <td>
                                                        <span style={{
                                                            backgroundColor: '#f1f5f9',
                                                            padding: '4px 8px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.85rem',
                                                            color: '#475569',
                                                            fontWeight: '500'
                                                        }}>
                                                            {event.category || 'Uncategorized'}
                                                        </span>
                                                    </td>
                                                    <td className="date-cell">
                                                        {event.date}
                                                    </td>
                                                    <td>
                                                        {event.location}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                                            <button
                                                                onClick={() => handleOpenModal('edit', event)}
                                                                className="edit-btn"
                                                                style={{
                                                                    backgroundColor: '#3b82f6',
                                                                    border: 'none',
                                                                    borderRadius: '8px',
                                                                    padding: '6px 12px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    cursor: 'pointer',
                                                                    color: 'white',
                                                                    fontWeight: '600',
                                                                    fontSize: '0.9rem'
                                                                }}
                                                            >
                                                                <Pencil size={16} color="white" strokeWidth={2.5} /> Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(event._id)}
                                                                className="delete-btn"
                                                                style={{
                                                                    backgroundColor: '#ef4444',
                                                                    border: 'none',
                                                                    borderRadius: '8px',
                                                                    padding: '6px 12px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '8px',
                                                                    cursor: 'pointer',
                                                                    color: 'white',
                                                                    fontWeight: '600',
                                                                    fontSize: '0.9rem'
                                                                }}
                                                            >
                                                                <Trash2 size={16} color="white" strokeWidth={2.5} /> Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>

                                {events.length > itemsPerPage && (
                                    <div className="pagination-section" style={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        alignItems: 'center',
                                        gap: '15px', 
                                        marginTop: '30px',
                                        padding: '20px',
                                        borderTop: '1px solid #f1f5f9'
                                    }}>
                                        <button
                                            className="page-btn"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => prev - 1)}
                                            style={{
                                                padding: '8px 20px',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                background: currentPage === 1 ? 'rgba(255,255,255,0.05)' : 'rgba(59, 130, 246, 0.1)',
                                                color: currentPage === 1 ? '#4b5563' : '#3b82f6',
                                                fontWeight: '600',
                                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                                transition: '0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            <ChevronLeft size={18} /> Previous
                                        </button>
                                        
                                        <div style={{ 
                                            padding: '8px 20px', 
                                            background: 'rgba(255,255,255,0.05)', 
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            color: '#94a3b8',
                                            fontSize: '0.9rem',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            Page {currentPage} of {Math.ceil(events.length / itemsPerPage)}
                                        </div>

                                        <button
                                            className="page-btn"
                                            disabled={currentPage >= Math.ceil(events.length / itemsPerPage)}
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                            style={{
                                                padding: '8px 20px',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                background: currentPage >= Math.ceil(events.length / itemsPerPage) ? 'rgba(255,255,255,0.05)' : 'rgba(59, 130, 246, 0.1)',
                                                color: currentPage >= Math.ceil(events.length / itemsPerPage) ? '#4b5563' : '#3b82f6',
                                                fontWeight: '600',
                                                cursor: currentPage >= Math.ceil(events.length / itemsPerPage) ? 'not-allowed' : 'pointer',
                                                transition: '0.2s',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}
                                        >
                                            Next <ChevronRight size={18} />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal */}
            <AnimatePresence>
                {modal.open && (
                    <div className="modal-overlay">
                        <motion.div
                            className="modal-content"
                            style={{
                                maxWidth: '700px',
                                width: '95%',
                                maxHeight: '95vh',
                                overflowY: 'auto',
                                padding: '30px'
                            }}
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem' }}>{modal.type === 'add' ? 'Add New Event' : 'Edit Event'}</h2>
                                <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="admin-form">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="form-group">
                                        <label>Event Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Category</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="" disabled>Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat.categoryName}>
                                                    {cat.categoryName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Tag</label>
                                        <select name="tag" value={formData.tag} onChange={handleInputChange}>
                                            <option value="Classic">Classic</option>
                                            <option value="Premium">Premium</option>
                                            <option value="Featured">Featured</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Date</label>
                                        <input
                                            type="text"
                                            name="date"
                                            placeholder="e.g. Oct 25, 2026"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Location</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Guests</label>
                                        <input
                                            type="text"
                                            name="guests"
                                            placeholder="e.g. 200+"
                                            value={formData.guests}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            required
                                            style={{ minHeight: '100px' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginTop: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '15px', fontWeight: '800', fontSize: '1.1rem', color: '#60a5fa' }}>
                                        Event Gallery (5 Photos Required)
                                    </label>
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
                                        gap: '15px' 
                                    }}>
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <div key={index} style={{ position: 'relative' }}>
                                                <div style={{
                                                    width: '100%',
                                                    aspectRatio: '1',
                                                    borderRadius: '12px',
                                                    border: '2px dashed rgba(255,255,255,0.1)',
                                                    background: 'rgba(255,255,255,0.02)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    overflow: 'hidden',
                                                    position: 'relative',
                                                    transition: '0.3s'
                                                }}
                                                onClick={() => document.getElementById(`file-input-${index}`).click()}
                                                onMouseOver={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                                                onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
                                                >
                                                    {imagePreviews[index] ? (
                                                        <img 
                                                            src={imagePreviews[index]} 
                                                            alt={`Preview ${index + 1}`} 
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <>
                                                            <ImageIcon size={24} color="#94a3b8" />
                                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '5px' }}>Photo {index + 1}</span>
                                                        </>
                                                    )}
                                                    <div style={{
                                                        position: 'absolute',
                                                        bottom: '0',
                                                        left: '0',
                                                        right: '0',
                                                        background: 'rgba(0,0,0,0.5)',
                                                        color: 'white',
                                                        fontSize: '10px',
                                                        textAlign: 'center',
                                                        padding: '2px 0'
                                                    }}>
                                                        {formData.images[index] instanceof File ? 'NEW' : (formData.images[index] ? 'SAVED' : 'EMPTY')}
                                                    </div>
                                                </div>
                                                <input
                                                    type="file"
                                                    id={`file-input-${index}`}
                                                    accept="image/*"
                                                    onChange={(e) => handleImageChange(index, e.target.files[0])}
                                                    style={{ display: 'none' }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <p style={{ marginTop: '10px', fontSize: '0.85rem', color: '#94a3b8' }}>
                                        * Click on a box to upload or change an image.
                                    </p>
                                </div>

                                <div className="modal-actions" style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                                    <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-submit" disabled={submitting}>
                                        {submitting ? 'Processing...' : (modal.type === 'add' ? 'Create Event' : 'Save Changes')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EventList;

