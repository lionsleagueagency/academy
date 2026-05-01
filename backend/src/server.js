import app from './app.js';
import { testConnection } from './config/database.js';
import { syncAllAdminInstructors } from './utils/adminInstructors.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testConnection();
    console.log('Database connected successfully');
    await syncAllAdminInstructors();
    console.log('Admin instructors synchronized');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
