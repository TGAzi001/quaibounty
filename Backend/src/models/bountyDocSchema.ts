interface bountyDocSchema { 
  id: string;
  bid: string;
  org: string;
  repo: string; 
  issueNumber: string;
  title: string;
  description: string;
  link: string;
  prize: number;
}

export default bountyDocSchema;