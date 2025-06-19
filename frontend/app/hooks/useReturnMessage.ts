import { useEffect } from 'react';

export function useReturnMessage() {
  useEffect(() => {
    const originalTitle = document.title;

    const onChange = () => {
      if (document.hidden) {
        document.title = 'Ohne dich ist\'s still – komm zurück!';
      } else {
        document.title = originalTitle;
      }
    };

    document.addEventListener('visibilitychange', onChange);
    return () => {
      document.removeEventListener('visibilitychange', onChange);
      document.title = originalTitle;
    };
  }, []);
}
