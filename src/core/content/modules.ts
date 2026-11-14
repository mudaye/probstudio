/**
 * Authoritative Curriculum Module and Part Catalog
 * Conforms to A-001 v0.4 §4.1 and A-005 v0.2 §2.1
 */

export interface PartInfo {
  readonly id: string;
  readonly number: number;
  readonly title: string;
  readonly summary: string;
  readonly moduleIds: readonly string[];
}

export interface ModuleInfo {
  readonly id: string;
  readonly partId: string;
  readonly title: string;
  readonly summary: string;
  readonly status: 'active' | 'planned';
  readonly conceptCount: number;
  readonly exerciseCount: number;
  readonly labAssociation?: string;
}

export const PARTS: readonly PartInfo[] = [
  {
    id: 'P1',
    number: 1,
    title: 'Part 1: Foundations & Discrete Random Variables',
    summary: 'Probability spaces, conditional probability, Bayes, independence, and discrete distributions.',
    moduleIds: ['M01', 'M02', 'M03', 'M04', 'M05', 'M06', 'M07', 'M08'],
  },
  {
    id: 'P2',
    number: 2,
    title: 'Part 2: Continuous Random Variables & Transforms',
    summary: 'Continuous PDFs/CDFs, continuous distributions, transformations, moments, inequalities, and simulation.',
    moduleIds: ['M09', 'M10', 'M11', 'M12', 'M13', 'M14', 'M15'],
  },
  {
    id: 'P3',
    number: 3,
    title: 'Part 3: Joint Distributions & Multivariate Models',
    summary: 'Joint distributions, marginals, conditional distributions, mixture models, IID sequences, and multivariate transformations.',
    moduleIds: ['M16', 'M17', 'M18', 'M19', 'M20', 'M21', 'M22'],
  },
];

export const MODULES: readonly ModuleInfo[] = [
  // Part 1: M01 - M08
  {
    id: 'M01',
    partId: 'P1',
    title: 'Probability Foundations',
    summary: 'Sample spaces, outcomes, events, and probability axioms.',
    status: 'active',
    conceptCount: 3,
    exerciseCount: 3,
    labAssociation: 'PL-01',
  },
  {
    id: 'M02',
    partId: 'P1',
    title: 'Conditional Probability',
    summary: 'Definition of conditional probability, conditioning on events, multiplication rule.',
    status: 'active',
    conceptCount: 2,
    exerciseCount: 1,
    labAssociation: 'PL-02',
  },
  {
    id: 'M03',
    partId: 'P1',
    title: "Total Probability and Bayes' Rule",
    summary: 'Finite partitions, law of total probability, and Bayes theorem.',
    status: 'active',
    conceptCount: 2,
    exerciseCount: 2,
    labAssociation: 'PL-02',
  },
  {
    id: 'M04',
    partId: 'P1',
    title: 'Event Independence',
    summary: 'Pairwise independence, mutual independence, and conditional independence.',
    status: 'active',
    conceptCount: 2,
    exerciseCount: 2,
    labAssociation: 'PL-03',
  },
  {
    id: 'M05',
    partId: 'P1',
    title: 'Random Variables and Induced Probability Measures',
    summary: 'Random variables as mappings from sample space to real numbers.',
    status: 'active',
    conceptCount: 2,
    exerciseCount: 2,
    labAssociation: 'PL-04',
  },
  {
    id: 'M06',
    partId: 'P1',
    title: 'Cumulative Distribution Functions',
    summary: 'Properties of CDFs: non-decreasing, right-continuous, limits at infinity.',
    status: 'active',
    conceptCount: 2,
    exerciseCount: 2,
    labAssociation: 'PL-05',
  },
  {
    id: 'M07',
    partId: 'P1',
    title: 'Discrete Random Variables and PMFs',
    summary: 'Probability mass functions, discrete support, and CDF relationships.',
    status: 'active',
    conceptCount: 2,
    exerciseCount: 2,
    labAssociation: 'PL-05',
  },
  {
    id: 'M08',
    partId: 'P1',
    title: 'Discrete Distributions',
    summary: 'Bernoulli, Binomial, Geometric, and Poisson models.',
    status: 'active',
    conceptCount: 2,
    exerciseCount: 2,
    labAssociation: 'PL-06',
  },

  // Part 2: M09 - M15
  {
    id: 'M09',
    partId: 'P2',
    title: 'Continuous Random Variables, PDFs, and Continuous CDFs',
    summary: 'Probability density functions, integration over intervals, continuous CDFs.',
    status: 'active',
    conceptCount: 2,
    exerciseCount: 2,
    labAssociation: 'PL-07',
  },
  {
    id: 'M10',
    partId: 'P2',
    title: 'Common Continuous Distributions',
    summary: 'Continuous Uniform, Exponential, and Normal/Gaussian distributions.',
    status: 'active',
    conceptCount: 2,
    exerciseCount: 1,
    labAssociation: 'PL-07',
  },
  {
    id: 'M11',
    partId: 'P2',
    title: 'Functions and Transformations of One Random Variable',
    summary: 'Monotone and piecewise transformations, PDF derivation methods.',
    status: 'active',
    conceptCount: 2,
    exerciseCount: 1,
    labAssociation: 'PL-07',
  },
  {
    id: 'M12',
    partId: 'P2',
    title: 'Expectation and Its Properties',
    summary: 'Expected value for discrete and continuous variables, linearity of expectation.',
    status: 'active',
    conceptCount: 2,
    exerciseCount: 1,
    labAssociation: 'PL-08',
  },
  {
    id: 'M13',
    partId: 'P2',
    title: 'Variance and Moment Relationships',
    summary: 'Variance, standard deviation, higher moments, and scaling properties.',
    status: 'active',
    conceptCount: 2,
    exerciseCount: 1,
    labAssociation: 'PL-08',
  },
  {
    id: 'M14',
    partId: 'P2',
    title: 'Probability Inequalities',
    summary: "Markov's inequality, Chebyshev's inequality, and Jensen's inequality.",
    status: 'active',
    conceptCount: 2,
    exerciseCount: 1,
    labAssociation: 'PL-08',
  },
  {
    id: 'M15',
    partId: 'P2',
    title: 'Simulation and Empirical Estimation',
    summary: 'Pseudo-random sampling, law of large numbers, empirical CDFs.',
    status: 'active',
    conceptCount: 1,
    exerciseCount: 1,
    labAssociation: 'PL-08',
  },

  // Part 3: M16 - M22
  {
    id: 'M16',
    partId: 'P3',
    title: 'Joint Distribution Functions',
    summary: 'Joint CDFs for pairs and vectors of random variables.',
    status: 'active',
    conceptCount: 2,
    exerciseCount: 1,
    labAssociation: 'PL-09',
  },
  {
    id: 'M17',
    partId: 'P3',
    title: 'Joint PMFs and Joint PDFs',
    summary: 'Bivariate discrete mass functions and continuous joint density functions.',
    status: 'active',
    conceptCount: 2,
    exerciseCount: 1,
    labAssociation: 'PL-09',
  },
  {
    id: 'M18',
    partId: 'P3',
    title: 'Marginal Distributions and Joint–Marginal Relationships',
    summary: 'Summing/integrating out variables to obtain marginal distributions.',
    status: 'active',
    conceptCount: 2,
    exerciseCount: 1,
    labAssociation: 'PL-09',
  },
  {
    id: 'M19',
    partId: 'P3',
    title: "Conditional Distributions and Bayes' Rule",
    summary: 'Conditional PMFs and PDFs, continuous conditioning.',
    status: 'planned',
    conceptCount: 0,
    exerciseCount: 0,
  },
  {
    id: 'M20',
    partId: 'P3',
    title: 'Mixture Models and Communication-System Example',
    summary: 'Discrete and continuous mixtures, binary symmetric channel example.',
    status: 'planned',
    conceptCount: 0,
    exerciseCount: 0,
  },
  {
    id: 'M21',
    partId: 'P3',
    title: 'Independence and IID Sequences',
    summary: 'Independent random variables, factorization of joint PMFs/PDFs, IID sequences.',
    status: 'active',
    conceptCount: 2,
    exerciseCount: 1,
    labAssociation: 'PL-09',
  },
  {
    id: 'M22',
    partId: 'P3',
    title: 'Multiple Variables, Mixed Conditioning, and Transformations',
    summary: 'Multivariate random vectors, Jacobian determinant for bivariate transformations.',
    status: 'planned',
    conceptCount: 0,
    exerciseCount: 0,
  },
];

export function getModulesByPart(partId: string): readonly ModuleInfo[] {
  return MODULES.filter((m) => m.partId === partId);
}

export function getModuleById(moduleId: string): ModuleInfo | undefined {
  return MODULES.find((m) => m.id === moduleId);
}

export function getPartById(partId: string): PartInfo | undefined {
  return PARTS.find((p) => p.id === partId);
}
