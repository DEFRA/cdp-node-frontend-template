import { renderComponent } from '~/src/server/common/test-helpers/component-helpers.js'

describe('Breadcrumbs Component', () => {
  const testId = 'app-breadcrumbs-list-item'
  /** @type {Cheerio<Element>} */
  let $breadcrumbs

  beforeEach(() => {
    $breadcrumbs = renderComponent('breadcrumbs', {
      items: [
        {
          text: 'Deployments',
          href: '/deployments'
        },
        {
          text: 'Magic service'
        }
      ]
    })('[data-testid="app-breadcrumbs"]').first()
  })

  test('Should render expected number of breadcrumbs', () => {
    expect($breadcrumbs.find(`[data-testid="${testId}"]`)).toHaveLength(2)
  })

  test('First breadcrumb should be a link', () => {
    const $firstBreadcrumbLink = $breadcrumbs
      .find(`[data-testid="${testId}"]`)
      .first()
      .find('[data-testid="app-breadcrumbs-link"]')

    expect($firstBreadcrumbLink.attr('href')).toBe('/deployments')
    expect($firstBreadcrumbLink.attr('class')).toBe('app-breadcrumbs__link')
  })

  test('Last breadcrumb should not be a link', () => {
    const $lastBreadcrumb = $breadcrumbs
      .find(`[data-testid="${testId}"]`)
      .last()

    expect($lastBreadcrumb.html()).not.toContain(
      `class="app-breadcrumbs__link"`
    )
  })
})

/**
 * @import { CheerioAPI, Cheerio } from 'cheerio'
 * @import { Element } from 'domhandler'
 */
