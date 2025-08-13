import { render, screen } from '@testing-library/react';
import { TaskProvider } from './context/TaskContext';
import App from './App';

test('renders app title', () => {
  render(
    <TaskProvider>
      <App />
    </TaskProvider>
  );
  const title = screen.getByTestId('app-title');
  expect(title).toBeInTheDocument();
});
