import React from 'react';
import Bridge from '../tools/bridge';
import { FaPen, FaTrash } from 'react-icons/fa';

type porfoliosResponseT = {
  id: string;
  projectsNumber: number;
  doneProjectsNumber: number;
  title: string;
  description: string;
  bgImg: string;
  status: 'todo' | 'in progress' | 'done';
  progress: number;
};

export default function Portfolio(props: {
  portfolioItem: porfoliosResponseT;
  refetch: () => void;
}) {
  const [portfolioItemState, setPortfolioItemState] = React.useState(
    props.portfolioItem
  );

  const editPortfolio = async () => {
    const resp = await Bridge('update', `portfolio`, {
      id: portfolioItemState.id,
      title: 'new portfolio new',
      description: 'portfolio item description new',
      bgImg: '',
      status: 'in progress',
    });

    if (!resp.err) {
      console.log(resp);
    }

    props.refetch();
  };

  const removePortfolio = async () => {
    const resp = await Bridge('remove', `portfolio`, {
      id: portfolioItemState.id,
    });

    if (!resp.err) {
      console.log(resp);
    }

    props.refetch();
  };

  return (
    <div aria-label='portfolio container' className={`max-w-min`}>
      <div
        aria-label='portfolio'
        className={`border-2 border-primary rounded-md
                        flex items-center justify-center w-[12rem]
                        h-[7rem] text-primary text-2xl
                        relative
                      `}
      >
        <button
          onClick={removePortfolio}
          className={`absolute top-2 left-2 text-xl`}
        >
          <FaTrash />
        </button>
        <button
          onClick={editPortfolio}
          className={`absolute top-2 right-2 text-xl`}
        >
          <FaPen />
        </button>
        <span aria-label='number of projects'>
          {portfolioItemState.doneProjectsNumber}/
          {portfolioItemState.projectsNumber}
        </span>
      </div>
      <h2 className='mt-3 text-xl'>{portfolioItemState.title}</h2>
      <p className='text-gray-800'>{portfolioItemState.description}</p>
    </div>
  );
}
