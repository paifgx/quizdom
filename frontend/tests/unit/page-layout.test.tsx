import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthPageLayout } from '../../app/components/ui/page-layout'

describe('AuthPageLayout', () => {
  const TestChild = () => <div data-testid="test-child">Test Content</div>

  it('renders children in the form container', () => {
    render(
      <AuthPageLayout>
        <TestChild />
      </AuthPageLayout>
    )

    expect(screen.getByTestId('test-child')).toBeDefined()
    expect(screen.getByText('Test Content')).toBeDefined()
  })

  it('displays the Quizdom logo', () => {
    render(
      <AuthPageLayout>
        <TestChild />
      </AuthPageLayout>
    )

    const logo = screen.getByAltText('Quizdom Logo')
    expect(logo).toBeDefined()
    expect(logo.getAttribute('src')).toBe('/logo/Logo_Quizdom_transparent.png')
  })

  it('displays the brand name and tagline', () => {
    render(
      <AuthPageLayout>
        <TestChild />
      </AuthPageLayout>
    )

    expect(screen.getByText('QUIZDOM')).toBeDefined()
    expect(screen.getByText('Rise of the Wise')).toBeDefined()
  })

  it('has proper container structure', () => {
    const { container } = render(
      <AuthPageLayout>
        <TestChild />
      </AuthPageLayout>
    )

    const mainContainer = container.firstChild as HTMLElement
    expect(mainContainer?.className).toContain('min-h-screen')
    expect(mainContainer?.className).toContain('bg-[#061421]')
    expect(mainContainer?.className).toContain('flex')
  })

  it('applies responsive classes to logo container', () => {
    const { container } = render(
      <AuthPageLayout>
        <TestChild />
      </AuthPageLayout>
    )

    // Check for hidden on mobile, flex on large screens
    const logoContainer = container.querySelector('.hidden.lg\\:flex')
    expect(logoContainer).toBeDefined()
  })

  it('wraps children in proper form container structure', () => {
    const { container } = render(
      <AuthPageLayout>
        <TestChild />
      </AuthPageLayout>
    )

    // Check for form container with white background
    const formContainer = container.querySelector('.bg-white')
    expect(formContainer).toBeDefined()
    
    // Check for max-width wrapper
    const wrapper = container.querySelector('.max-w-md')
    expect(wrapper).toBeDefined()
  })

  it('renders brand elements with proper styling', () => {
    render(
      <AuthPageLayout>
        <TestChild />
      </AuthPageLayout>
    )

    const brandName = screen.getByText('QUIZDOM')
    expect(brandName.className).toContain('text-4xl')
    expect(brandName.className).toContain('font-bold')
    expect(brandName.className).toContain('text-[#FCC822]')

    const tagline = screen.getByText('Rise of the Wise')
    expect(tagline.className).toContain('text-xl')
    expect(tagline.className).toContain('text-gray-300')
  })
}) 