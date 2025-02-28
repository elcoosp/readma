import Heading from '@theme/Heading'
import clsx from 'clsx'
import LayersIcon from '../LayersIcon'
import styles from './styles.module.css'
import { JSX } from 'react'
type FeatureItem =
  & {
    title: string
    description: JSX.Element
  }
  & ({
    Svg: React.ComponentType<React.ComponentProps<'svg'>>
  } | { img: string })

const FeatureList: FeatureItem[] = [
  {
    title: 'Workspace compatible',
    Svg: LayersIcon,
    description: (
      <>
        Readma was designed from the ground up to be easily installed and used
        on a workspace
      </>
    ),
  },
  {
    title: 'Automatic shields',
    img: require('@site/static/img/shields-logo.png').default,
    description: (
      <>
        No more shield badges manual gathering, with sane defaults and links
      </>
    ),
  },
  {
    title: 'Cross platform',
    img: require('@site/static/img/deno-rust-logo.png').default,
    description: (
      <>
        Works on both your <code>deno</code> and <code>rust</code> projects
      </>
    ),
  },
]

function Feature(props: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className='text--center'>
        {'img' in props
          ? <img src={props.img} className={styles.featureSvg}></img>
          : <props.Svg className={styles.featureSvg} role='img' />}
      </div>
      <div className='text--center padding-horiz--md'>
        <Heading as='h3'>{props.title}</Heading>
        <p>{props.description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className='container'>
        <div className='row'>
          {FeatureList.map((props, idx) => <Feature key={idx} {...props} />)}
        </div>
      </div>
    </section>
  )
}
