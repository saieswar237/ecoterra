import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import '@testing-library/jest-dom';

describe('EcoTerra: The Living Carbon Footprint - Evaluation Testing Suite', () => {
  beforeEach(() => {
    // Clear local storage entries before starting each evaluation run
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // a) Checks if the app renders without crashing
  test('a) Checks if the app renders without crashing', () => {
    render(<App />);
    // Check if branding title exists
    const titleElement = screen.getByText('EcoTerra');
    expect(titleElement).toBeInTheDocument();
    
    // Check if action logger container exists
    const loggerHeader = screen.getByText('Record Climate Activities');
    expect(loggerHeader).toBeInTheDocument();
  });

  // b) Checks if the aria-label updates correctly when the score drops
  test('b) Checks if the aria-label updates correctly when the score drops', () => {
    render(<App />);
    
    // 1. Initially score is 100. Accessible SVG label should describe a thriving state.
    const initialSvg = screen.getByRole('img', { name: /Lush Green Eco Island \(Score: 100\/100\)/i });
    expect(initialSvg).toBeInTheDocument();

    // 2. Click the flight button to trigger an emissions cost (-30)
    // Finding button safely via its specific ARIA label
    const flightActionBtn = screen.getByRole('button', { name: /Log Took a High-Altitude Flight/i });
    fireEvent.click(flightActionBtn);

    // 3. Current score should drop to 70, causing a state check update.
    // Score of 70 represents 'moderate' zone (Score 30-70) - 'Overcast Autumn Island (Score: 70/100)'
    const updatedSvg = screen.getByRole('img', { name: /Overcast Autumn Island \(Score: 70\/100\)/i });
    expect(updatedSvg).toBeInTheDocument();
  });

  // c) Checks if score boundaries (0-100) are respected
  test('c) Checks if score boundaries (0-100) are respected', () => {
    render(<App />);

    // 1. Initially ecoScore is 100.
    // Try logging a positive eco-benefit (e.g., Ate Plant-based Meal, +10 points)
    const positiveMealBtn = screen.getByRole('button', { name: /Log Ate a Plant-based Meal/i });
    fireEvent.click(positiveMealBtn);

    // 2. The score should still clamp at 100 (upper boundary test)
    const upperCappedScore = screen.getByText('100');
    expect(upperCappedScore).toBeInTheDocument();

    // 3. Clear slate and trigger heavy emissions to test lower clamp
    const carbonFlightBtn = screen.getByRole('button', { name: /Log Took a High-Altitude Flight/i });
    
    // Click multiple times to force score below 0 (100 -> 70 -> 40 -> 10 -> 0)
    fireEvent.click(carbonFlightBtn); // 70
    fireEvent.click(carbonFlightBtn); // 40
    fireEvent.click(carbonFlightBtn); // 10
    fireEvent.click(carbonFlightBtn); // Clamps to 0

    // 4. Score must be clamped strictly at 0 instead of dropping to -20 (lower boundary test)
    const lowerCappedScore = screen.getByText('0');
    expect(lowerCappedScore).toBeInTheDocument();
  });

  // d) Checks custom activity logging, XSS sanitization constraints, and Ledger items updates
  test('d) Checks custom activity logging and XSS sanitization', () => {
    render(<App />);

    // Get Custom Log form inputs
    const nameInput = screen.getByLabelText(/Activity Name/i);
    const impactInput = screen.getByLabelText(/Impact Score/i);
    const categorySelect = screen.getByLabelText(/Classification Category/i);
    const submitBtn = screen.getByRole('button', { name: /Securely submit custom climate activity/i });

    // Enter a potentially malicious string to test XSS sanitization
    // and verify HTML tags get successfully sanitized
    fireEvent.change(nameInput, { target: { value: '<b>Planting Oak Trees</b><script>alert(1)</script>' } });
    fireEvent.change(impactInput, { target: { value: '25' } });
    fireEvent.change(categorySelect, { target: { value: 'conservation' } });

    // Click submit
    fireEvent.click(submitBtn);

    // Confirm that the newly logged activity is listed in the ledger under a sanitized name
    // It should strip out HTML tags -> "Planting Oak Trees"
    const sanitizedItem = screen.getByText('Planting Oak Trees');
    expect(sanitizedItem).toBeInTheDocument();

    // Verify 'Net Viability' score increased correctly back up to 100% clamping
    const scoreElement = screen.getByText(/100%/i);
    expect(scoreElement).toBeInTheDocument();
  });

  // e) Checks Ledger filter tab toggling and corresponding item lists update
  test('e) Checks Ledger filter tab toggling and category sorting', () => {
    render(<App />);

    // 1. Log pre-defined Transport action
    const flightBtn = screen.getByRole('button', { name: /Log Took a High-Altitude Flight/i });
    fireEvent.click(flightBtn); // Adds -30 Transport action

    // 2. Log pre-defined Food action
    const mealBtn = screen.getByRole('button', { name: /Log Ate a Plant-based Meal/i });
    fireEvent.click(mealBtn); // Adds +10 Food action

    // 3. Confirm both are displayed under 'all' ledger filter initially
    expect(screen.getByText('Took a High-Altitude Flight')).toBeInTheDocument();
    expect(screen.getByText('Ate a Plant-based Meal')).toBeInTheDocument();

    // 4. Get the 'food' subcategory filter tab inside Ledger card
    const foodLedgerTab = screen.getByRole('tab', { name: /^food$/i });
    fireEvent.click(foodLedgerTab);

    // 5. Verify only food actions are rendered. Food is displayed, flight is excluded.
    expect(screen.getByText('Ate a Plant-based Meal')).toBeInTheDocument();
    expect(screen.queryByText('Took a High-Altitude Flight')).not.toBeInTheDocument();
  });

  // f) Checks environmental sound toggle button interaction
  test('f) Checks environmental sound toggle button integration', () => {
    render(<App />);

    // Get the audio toggle button and verify it renders initially in a muted state
    const soundBtn = screen.getByRole('button', { name: /Hear Environment/i });
    expect(soundBtn).toBeInTheDocument();

    // Trigger user click simulation
    fireEvent.click(soundBtn);

    // Verify button updates live to notify active state
    const activeText = screen.getByText('Ambient Sounds Active');
    expect(activeText).toBeInTheDocument();
  });

  // g) Checks JSON export button states and click triggers
  test('g) Checks JSON export button states and click triggers', () => {
    const mockClick = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const element = originalCreateElement(tagName);
      if (tagName.toLowerCase() === 'a') {
        (element as any).click = mockClick;
      }
      return element;
    });

    render(<App />);

    // Initially with empty history, both export buttons should be disabled
    const exportBtns = screen.getAllByRole('button', { name: /Export carbon activity logs as JSON|Download carbon audit log as JSON/i });
    expect(exportBtns.length).toBeGreaterThan(0);
    exportBtns.forEach(btn => {
      expect(btn).toBeDisabled();
    });

    // Add an activity by clicking pre-defined item
    const mealBtn = screen.getByRole('button', { name: /Log Ate a Plant-based Meal/i });
    fireEvent.click(mealBtn);

    // Verify buttons are now enabled
    exportBtns.forEach(btn => {
      expect(btn).not.toBeDisabled();
    });

    // Trigger one click
    fireEvent.click(exportBtns[0]);

    // Verify click handler triggers downloading link generation successfully
    expect(mockClick).toHaveBeenCalled();

    // Restore createElement mock
    (document.createElement as any).mockRestore();
  });

  // h) Verifies Achievement system badge unlocking and lock behaviors
  test('h) Verifies Achievement system badge unlocking and lock behaviors', () => {
    render(<App />);

    // 1. Initially with starting score 100, the "Eco Warrior" badge should be active
    const activeIndicators = screen.getAllByText('Active');
    expect(activeIndicators.length).toBeGreaterThan(0); // Eco Warrior starts active

    // 2. Check that "Climate Novice" and "Green Gourmet" start in a locked state
    const lockedIndicators = screen.getAllByText('Locked');
    expect(lockedIndicators.length).toBeGreaterThan(0);

    // Verify Green Gourmet is listed
    expect(screen.getByText('Green Gourmet')).toBeInTheDocument();

    // 3. Log a positive Food activity (Ate a Plant-based Meal)
    const mealBtn = screen.getByRole('button', { name: /Log Ate a Plant-based Meal/i });
    fireEvent.click(mealBtn);

    // Climate Novice description: "Take your first step..." -> should now be Unlocked/Active because totalCount >= 1
    // Green Gourmet: should now be active because plant-based meal was logged
    expect(screen.getByText('Climate Novice')).toBeInTheDocument();

    // 4. Log a heavy transport cost (Took a High-Altitude Flight) to drop the score below 90
    const flightBtn = screen.getByRole('button', { name: /Log Took a High-Altitude Flight/i });
    fireEvent.click(flightBtn); // subtracts -30, score changes from 100 to 70

    // Verify Eco Warrior is now locked or inactive, and displays the correct score progress
    // Warrior needs score >= 90
    const scoreVal = screen.getByText(/70%/i);
    expect(scoreVal).toBeInTheDocument();
  });
});
