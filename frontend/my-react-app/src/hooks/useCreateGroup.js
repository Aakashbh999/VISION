import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGroup } from '../services/group';
import { useNavigate } from 'react-router-dom';

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: createGroup,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['groups']);
      navigate(`/portal/groups/${data.group_id}`);
    },
  });
};