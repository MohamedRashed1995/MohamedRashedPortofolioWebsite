using System.ComponentModel.DataAnnotations;
using FluentAssertions;
using Portfolio.Application.DTOs;

namespace Backend.Tests;

public class UnitTest1
{
    [Fact]
    public void Inquiry_requires_valid_contact_fields()
    {
        var inquiry = new InquiryCreateDto { Name = "A", Email = "invalid", InquiryType = "General", Message = "short" };
        var results = new List<ValidationResult>();
        var valid = Validator.TryValidateObject(inquiry, new ValidationContext(inquiry), results, true);
        valid.Should().BeFalse();
        results.Should().Contain(item => item.MemberNames.Contains(nameof(InquiryCreateDto.Email)));
        results.Should().Contain(item => item.MemberNames.Contains(nameof(InquiryCreateDto.Message)));
    }
}