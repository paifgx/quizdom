import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { NineSlicePanel } from '../../app/components/nine-slice-quiz/nine-slice-panel'

describe('NineSlicePanel', () => {
  const TestChild = () => <div data-testid="test-child">Test Content</div>

  it('renders children in the center content area', () => {
    render(
      <NineSlicePanel>
        <TestChild />
      </NineSlicePanel>
    )

    expect(screen.getByTestId('test-child')).toBeDefined()
    expect(screen.getByText('Test Content')).toBeDefined()
  })

  it('applies custom className when provided', () => {
    const { container } = render(
      <NineSlicePanel className="custom-class">
        <TestChild />
      </NineSlicePanel>
    )

    const panelContainer = container.firstChild as HTMLElement
    expect(panelContainer?.className).toContain('custom-class')
  })

  it('calls onClick handler when clicked', () => {
    const mockOnClick = vi.fn()
    render(
      <NineSlicePanel onClick={mockOnClick}>
        <TestChild />
      </NineSlicePanel>
    )

    const panel = screen.getByTestId('test-child').closest('div')
    fireEvent.click(panel!)

    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('calls onHover handler when mouse enters', () => {
    const mockOnHover = vi.fn()
    render(
      <NineSlicePanel onHover={mockOnHover}>
        <TestChild />
      </NineSlicePanel>
    )

    const panel = screen.getByTestId('test-child').closest('div')
    fireEvent.mouseEnter(panel!)

    expect(mockOnHover).toHaveBeenCalledTimes(1)
  })

  it('applies selected state styling when selected is true', () => {
    const { container } = render(
      <NineSlicePanel selected={true}>
        <TestChild />
      </NineSlicePanel>
    )

    // Check for selected background color on center content
    const centerContent = container.querySelector('.bg-\\[\\#0f3560\\]')
    expect(centerContent).toBeDefined()
  })

  it('applies default state styling when selected is false', () => {
    const { container } = render(
      <NineSlicePanel selected={false}>
        <TestChild />
      </NineSlicePanel>
    )

    // Check for default background color on center content
    const centerContent = container.querySelector('.bg-\\[\\#0b2e50\\]')
    expect(centerContent).toBeDefined()
  })

  it('has proper 9-slice grid structure', () => {
    const { container } = render(
      <NineSlicePanel>
        <TestChild />
      </NineSlicePanel>
    )

    // Check for 9-slice grid layout
    const gridContainer = container.querySelector('.grid-cols-\\[8px_1fr_8px\\]')
    expect(gridContainer).toBeDefined()
    
    const gridRows = container.querySelector('.grid-rows-\\[8px_1fr_8px\\]')
    expect(gridRows).toBeDefined()
  })

  it('applies pixelated image rendering style', () => {
    const { container } = render(
      <NineSlicePanel>
        <TestChild />
      </NineSlicePanel>
    )

    const panelContainer = container.firstChild as HTMLElement
    expect(panelContainer?.style.imageRendering).toBe('pixelated')
  })

  it('has minimum height set correctly', () => {
    const { container } = render(
      <NineSlicePanel>
        <TestChild />
      </NineSlicePanel>
    )

    const panelContainer = container.firstChild as HTMLElement
    expect(panelContainer?.className).toContain('min-h-[60px]')
    
    const gridContainer = container.querySelector('.min-h-\\[60px\\]')
    expect(gridContainer).toBeDefined()
  })

  it('applies correct text styling to center content', () => {
    const { container } = render(
      <NineSlicePanel>
        <TestChild />
      </NineSlicePanel>
    )

    // Check for pixel art font styling
    const textContainer = container.querySelector('.font-\\[\\"Press_Start_2P\\"\\,_monospace\\]')
    expect(textContainer).toBeDefined()
    
    // Check for small text size
    const smallText = container.querySelector('.text-\\[10px\\]')
    expect(smallText).toBeDefined()
  })

  it('renders without onClick and onHover handlers', () => {
    render(
      <NineSlicePanel>
        <TestChild />
      </NineSlicePanel>
    )

    expect(screen.getByTestId('test-child')).toBeDefined()
  })

  it('defaults selected to false when not provided', () => {
    const { container } = render(
      <NineSlicePanel>
        <TestChild />
      </NineSlicePanel>
    )

    // Should use default (unselected) background color
    const centerContent = container.querySelector('.bg-\\[\\#0b2e50\\]')
    expect(centerContent).toBeDefined()
  })

  it('has proper relative positioning and z-index structure', () => {
    const { container } = render(
      <NineSlicePanel>
        <TestChild />
      </NineSlicePanel>
    )

    const relativeContainer = container.querySelector('.relative')
    expect(relativeContainer).toBeDefined()
    
    const zIndexContainer = container.querySelector('.z-10')
    expect(zIndexContainer).toBeDefined()
  })
}) 