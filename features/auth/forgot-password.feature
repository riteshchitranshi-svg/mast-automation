@forgot-password
Feature: Forgot Password

  @TC_LOGIN_008
  Scenario: Navigate to Forgot Password page from login
    Given I am on the login page
    When I click the Forgot password link
    Then I should be on the forgot password page
    And the reset form elements should be visible

  @TC_LOGIN_009
  Scenario: Submit Forgot Password form with a registered email
    Given I am on the forgot password page
    When I submit a password reset for "valid_user"
    Then I should be redirected to the login page
    And I should see the password reset confirmation message

  @TC_LOGIN_010
  Scenario: Submit Forgot Password form with an unregistered email shows generic message
    Given I am on the forgot password page
    When I submit a password reset for "invalid_user"
    Then I should be redirected to the login page
    And I should see the password reset confirmation message

  @TC_LOGIN_011
  Scenario: Navigate back to login from Forgot Password page
    Given I am on the forgot password page
    When I click the Back to login link
    Then I should be on the login page
