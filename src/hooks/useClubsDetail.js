import { useState, useEffect } from 'react';
import { clubService } from '../api/services/clubService';

export const useClubDetail = (clubId) => {
  const [club, setClub] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!clubId) return;

    const fetchClubDetail = async () => {
      setError(null);
      
      try {
        const response = await clubService.getClubDetail(clubId);
        setClub(response.data || response);
      } catch (err) {
        setError(err.message);
        setClub(null);
      }
    };

    fetchClubDetail();
  }, [clubId]);

  return { club, error };
};