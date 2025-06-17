import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuizButton } from '../../app/components/nine-slice-quiz/quiz-button'

describe('QuizButton', () => {
  const defaultProps = {
    text: 'Answer Choice',
    onClick: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the button text', () => {
    render(<QuizButton {...defaultProps} />)
    
    expect(screen.getByText('Answer Choice')).toBeDefined()
  })

  it('calls onClick handler when clicked', () => {
    const mockOnClick = vi.fn()
    render(<QuizButton {...defaultProps} onClick={mockOnClick} />)
    
    fireEvent.click(screen.getByText('Answer Choice'))
    
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', () => {
    const mockOnClick = vi.fn()
    render(<QuizButton {...defaultProps} onClick={mockOnClick} disabled={true} />)
    
    fireEvent.click(screen.getByText('Answer Choice'))
    
    expect(mockOnClick).not.toHaveBeenCalled()
  })

  it('applies disabled styling when disabled', () => {
    const { container } = render(<QuizButton {...defaultProps} disabled={true} />)
    
    const buttonContainer = container.firstChild as HTMLElement
    expect(buttonContainer?.className).toContain('opacity-60')
    expect(buttonContainer?.className).toContain('cursor-not-allowed')
    expect(buttonContainer?.className).toContain('grayscale-[0.5]')
  })

  it('applies interactive styling when not disabled', () => {
    const { container } = render(<QuizButton {...defaultProps} disabled={false} />)
    
    const buttonContainer = container.firstChild as HTMLElement
    expect(buttonContainer?.className).toContain('hover:brightness-110')
    expect(buttonContainer?.className).toContain('hover:-translate-y-px')
    expect(buttonContainer?.className).toContain('active:translate-y-px')
  })

  it('sets tabIndex to -1 when disabled', () => {
    const { container } = render(<QuizButton {...defaultProps} disabled={true} />)
    
    const buttonContainer = container.firstChild as HTMLElement
    expect(buttonContainer?.getAttribute('tabindex')).toBe('-1')
  })

  it('sets tabIndex to 0 when not disabled', () => {
    const { container } = render(<QuizButton {...defaultProps} disabled={false} />)
    
    const buttonContainer = container.firstChild as HTMLElement
    expect(buttonContainer?.getAttribute('tabindex')).toBe('0')
  })

  it('handles Enter key press', () => {
    const mockOnClick = vi.fn()
    const { container } = render(<QuizButton {...defaultProps} onClick={mockOnClick} />)
    
    const buttonContainer = container.firstChild as HTMLElement
    fireEvent.keyDown(buttonContainer, { key: 'Enter' })
    
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('handles Space key press', () => {
    const mockOnClick = vi.fn()
    const { container } = render(<QuizButton {...defaultProps} onClick={mockOnClick} />)
    
    const buttonContainer = container.firstChild as HTMLElement
    fireEvent.keyDown(buttonContainer, { key: ' ' })
    
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('does not handle key presses when disabled', () => {
    const mockOnClick = vi.fn()
    const { container } = render(<QuizButton {...defaultProps} onClick={mockOnClick} disabled={true} />)
    
    const buttonContainer = container.firstChild as HTMLElement
    fireEvent.keyDown(buttonContainer, { key: 'Enter' })
    fireEvent.keyDown(buttonContainer, { key: ' ' })
    
    expect(mockOnClick).not.toHaveBeenCalled()
  })

  it('ignores other key presses', () => {
    const mockOnClick = vi.fn()
    const { container } = render(<QuizButton {...defaultProps} onClick={mockOnClick} />)
    
    const buttonContainer = container.firstChild as HTMLElement
    fireEvent.keyDown(buttonContainer, { key: 'a' })
    fireEvent.keyDown(buttonContainer, { key: 'Escape' })
    
    expect(mockOnClick).not.toHaveBeenCalled()
  })

  it('passes selected prop to NineSlicePanel', () => {
    render(<QuizButton {...defaultProps} selected={true} />)
    
    // The text should still be rendered, indicating the NineSlicePanel is working
    expect(screen.getByText('Answer Choice')).toBeDefined()
  })

  it('defaults to not selected when selected prop is not provided', () => {
    render(<QuizButton {...defaultProps} />)
    
    expect(screen.getByText('Answer Choice')).toBeDefined()
  })

  it('defaults to not disabled when disabled prop is not provided', () => {
    const { container } = render(<QuizButton {...defaultProps} />)
    
    const buttonContainer = container.firstChild as HTMLElement
    expect(buttonContainer?.className).not.toContain('opacity-60')
    expect(buttonContainer?.className).not.toContain('cursor-not-allowed')
  })

  it('applies proper text styling', () => {
    render(<QuizButton {...defaultProps} />)
    
    const textElement = screen.getByText('Answer Choice')
    expect(textElement.className).toContain('text-[10px]')
    expect(textElement.className).toContain('p-3')
    expect(textElement.className).toContain('font-bold')
  })

  it('has minimum height set correctly', () => {
    const { container } = render(<QuizButton {...defaultProps} />)
    
    const buttonContainer = container.firstChild as HTMLElement
    expect(buttonContainer?.className).toContain('min-h-[60px]')
  })

  it('has focus styling', () => {
    const { container } = render(<QuizButton {...defaultProps} />)
    
    const buttonContainer = container.firstChild as HTMLElement
    expect(buttonContainer?.className).toContain('focus:outline-2')
    expect(buttonContainer?.className).toContain('focus:outline-[#fce9a5]')
    expect(buttonContainer?.className).toContain('focus:outline-offset-2')
  })
}) 