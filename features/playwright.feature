Feature: Playwright website

  Background:
    Given I navigate to the Playwright homepage

  Scenario: Page has correct title
    Then the page title should contain "Playwright"

  Scenario: Get started navigation
    When I click the "Get started" link
    Then I should see the heading "Installation"
