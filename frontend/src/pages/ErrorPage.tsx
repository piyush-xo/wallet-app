import React from 'react';
import styles from './ErrorPage.module.css';

const ErrorPage: React.FC = () => {
  return (
    <div className={styles.errorContainer}>
      <h1>404 - Page Not Found</h1>
    </div>
  );
};

export default ErrorPage;