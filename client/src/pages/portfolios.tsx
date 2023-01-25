import { useQuery } from 'react-query';
import Bridge from '../tools/bridge';
import Genid from '../tools/genid';
import Portfolio from '../components/portfolio';

export default function Portfolios() {
  const portfoliosQuery = useQuery('portfolios', async () => {
    const response = await Bridge('read', `portfolio/all`);
    return response?.err == 'serverError' ? false : response.data;
  });

  if (portfoliosQuery.status == 'success') {
    // console.log(portfoliosQuery.data)
  }

  type porfoliosResponseT = {
    id: string,
    projectsNumber: number;
    doneProjectsNumber: number;
    title: string;
    description: string;
    bgImg: string;
    status: 'todo' | 'in progress' | 'done';
    progress: number
  };

  const createNewPortfolio = async () => {
    const resp = await Bridge('post', `portfolio`, {
      title: 'new portfolio',
      description: 'portfolio item description',
      bgImg: '',
      status: 'todo',
    });

    if (!resp.err) {
      console.log(resp);
    }

    portfoliosQuery.refetch();
  };

  const tailwindClx = {
    portfolioBorder: 'border-2 border-primary rounded-md',
    portfolioItem: `flex items-center justify-center w-[12rem]
                    h-[7rem] text-primary text-2xl`,
  };

  const listPortfolios = () => {
    return portfoliosQuery.data.map((portfolioItem:porfoliosResponseT) => {
      // randome key to keep the UI from staling
      return <Portfolio key={`${Genid(20)}`} portfolioItem={portfolioItem} refetch={portfoliosQuery.refetch} />;
    });
  };

  return (
    <main
      aria-label='portfolios'
      className='text-black mt-[7rem] pl-20 flex gap-6'
    >
      {portfoliosQuery.status == 'success' ? listPortfolios() : <></>}

      {/* new portfolio button*/}
      <button
        onClick={createNewPortfolio}
        className={`${tailwindClx.portfolioBorder} ${tailwindClx.portfolioItem}`}
      >
        +
      </button>
    </main>
  );
}
