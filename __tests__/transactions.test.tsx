import React from 'react';
import { render, screen, waitFor} from '@testing-library/react';
import Transactions from '../src/components/Transactions';
import axios from 'axios';
import userEvent from '@testing-library/user-event';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Transactions Component', () => {
  it('displays loaded transactions', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          type: 'Expense',
          amount: 50,
          category: 'Groceries',
          date: '2024-03-01',
        },
      ],
    });

    render(<Transactions />);

    expect(await screen.findByText((content) => content.includes('Groceries'))).toBeInTheDocument();
    expect(screen.getAllByText((text) => text.includes('Expense'))[0]).toBeInTheDocument();

  });
});



it('adds a new transaction', async () => {
  mockedAxios.get.mockResolvedValueOnce({ data: [] }); // initial empty list
  mockedAxios.post.mockResolvedValueOnce({
    data: {
      id: 2,
      type: 'Income',
      amount: 200,
      category: 'Bonus',
      date: '2024-03-02',
    },
  });

  render(<Transactions />);
  const user = userEvent.setup();
  const categoryInputs = screen.getAllByPlaceholderText(/category/i);

  await user.selectOptions(screen.getByLabelText(/type/i), 'Income');
  await user.type(screen.getByPlaceholderText(/amount/i), '200');
  await user.type(categoryInputs[0], 'Bonus');
  await user.type(screen.getByLabelText(/date/i), '2024-03-02');


  await user.click(screen.getByRole('button', { name: /add transaction/i }));

  expect(await screen.findByText((text) => text.includes('Bonus'))).toBeInTheDocument();
  expect(screen.getAllByText((text) => text.includes('Income'))[0]).toBeInTheDocument();


});

it('updates a transaction', async () => {
  mockedAxios.get.mockResolvedValueOnce({
    data: [
      {
        id: 4,
        type: 'Expense',
        amount: 100,
        category: 'Shopping',
        date: '2024-03-05',
      },
    ],
  });

  mockedAxios.put.mockResolvedValueOnce({}); // simulate success

  render(<Transactions />);
  await userEvent.click(await screen.findByText(/edit/i));

  const categoryInput = screen.getAllByPlaceholderText(/category/i)[0];
  await userEvent.clear(categoryInput);
  await userEvent.type(categoryInput, 'Clothes');

  await userEvent.click(screen.getByRole('button', { name: /update transaction/i }));

  expect(await screen.findByText((text) => text.includes('Clothes'))).toBeInTheDocument();


});

it('deletes a transaction', async () => {
  mockedAxios.get.mockResolvedValueOnce({
    data: [
      {
        id: 3,
        type: 'Expense',
        amount: 70,
        category: 'Dining',
        date: '2024-03-04',
      },
    ],
  });

  mockedAxios.delete.mockResolvedValueOnce({});

  render(<Transactions />);
  const deleteButton = await screen.findByRole('button', { name: /delete/i });

  await userEvent.click(deleteButton);

  await waitFor(() =>
    expect(screen.queryByText('Dining')).not.toBeInTheDocument()
  );
});





