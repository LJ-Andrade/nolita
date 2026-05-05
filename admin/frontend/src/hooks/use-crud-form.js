import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axiosClient from '@/lib/axios';
import { toast } from 'sonner';

/**
 * Hook for CRUD form operations
 * Handles form state, validation, submitssion, and error handling
 * 
 * @param {Object} config - Configuration object
 * @param {string} config.endpoint - API endpoint (e.g., 'product-categories')
 * @param {string|number} config.id - Entity ID for edit mode (undefined for create)
 * @param {Object} config.schema - Zod validation schema
 * @param {Object} config.defaultValues - Default form values
 * @param {Function} config.onSuccess - Callback on successful submitssion
 * @param {Object} config.messages - Custom success/error messages
 * @returns {Object} Form operations and state
 */
export function useCrudForm({
  endpoint,
  id,
  schema,
  defaultValues,
  onSuccess,
  messages = {}
}) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [entityName, setEntityName] = useState('');

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues
  });

  const {
    createSuccess = 'Created successfully',
    createError = 'Error creating item',
    updateSuccess = 'Updated successfully',
    updateError = 'Error updating item',
    fetchError = 'Error fetching item'
  } = messages;

  // Fetch entity data in edit mode
  useEffect(() => {
    if (id) {
      setFetching(true);
      axiosClient
        .get(`${endpoint}/${id}`)
        .then(({ data }) => {
          const entityData = data.data || data;
          const { image, ...rest } = entityData;
          form.reset(rest);
          setEntityName(entityData.name || entityData.title || '');
          setFetching(false);
        })
        .catch((error) => {
          console.error('Fetch error:', error);
          toast.error(fetchError);
          setFetching(false);
        });
    }
  }, [id, endpoint, form, fetchError]);

  // Set server validation errors
  const setServerErrors = useCallback((errors) => {
    if (errors && typeof errors === 'object') {
      Object.entries(errors).forEach(([key, messages]) => {
        const message = Array.isArray(messages) ? messages[0] : messages;
        form.setError(key, { message });
      });
    }
  }, [form]);

  // Submit handler
  const onSubmit = useCallback(async (values) => {
    console.log('=== SUBMIT VALUES ===', values);
    console.log('=== IMAGE TYPE ===', values.image?.constructor?.name);
    setLoading(true);

    try {
      let response;

      const buildFormData = (vals) => {
        const formData = new FormData();
        Object.entries(vals).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== '') {
            // Only append image if it's a File object
            if (key === 'image' && !(value instanceof File)) {
              return;
            }
            formData.append(key, value);
          }
        });
        return formData;
      };

      if (id) {
        const formData = buildFormData(values);
        formData.append('_method', 'PUT');
        
        response = await axiosClient.post(`${endpoint}/${id}`, formData);
        toast.success(updateSuccess);
      } else {
        const formData = buildFormData(values);
        
        response = await axiosClient.post(endpoint, formData);
        toast.success(createSuccess);
      }

      if (onSuccess) {
        onSuccess(response);
      }

      return response;
    } catch (error) {
      const serverErrors = error.response?.data?.errors;
      
      if (serverErrors) {
        setServerErrors(serverErrors);
      } else {
        toast.error(id ? updateError : createError);
      }
      
      console.error('Submit error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [id, endpoint, onSuccess, createSuccess, updateSuccess, createError, updateError, setServerErrors]);

  return {
    // Form instance from react-hook-form
    form,
    
    // State
    loading,
    fetching,
    entityName,
    setEntityName,
    
    // Actions
    onSubmit,
    setServerErrors
  };
}
