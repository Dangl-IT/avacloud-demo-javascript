using System;
using System.Linq;
using Nuke.Common;
using Nuke.Common.ProjectModel;
using static Nuke.Common.EnvironmentInfo;
using static Nuke.Common.IO.FileSystemTasks;
using static Nuke.Common.IO.PathConstruction;
using static Nuke.Common.Tools.Npm.NpmTasks;
using Nuke.Common.Utilities;
using static Nuke.WebDocu.WebDocuTasks;
using Nuke.Azure.KeyVault;
using Nuke.WebDocu;
using Nuke.Common.Tools.GitVersion;

class Build : NukeBuild
{
    public static int Main () => Execute<Build>(x => x.Publish);

    [Parameter("Configuration to build - Default is 'Debug' (local) or 'Release' (server)")]
    readonly string Configuration = IsLocalBuild ? "Debug" : "Release";

    AbsolutePath SolutionDirectory => Solution.Directory;
    AbsolutePath OutputDirectory => SolutionDirectory / "output";
    AbsolutePath ZipPath => SolutionDirectory /  "page.zip";

    [Solution("avacloud-demo-javascript.sln")]
    Solution Solution;
    [GitVersion] readonly GitVersion GitVersion;

    [KeyVaultSettings(
        BaseUrlParameterName = nameof(KeyVaultBaseUrl),
        ClientIdParameterName = nameof(KeyVaultClientId),
        ClientSecretParameterName = nameof(KeyVaultClientSecret))]
    readonly KeyVaultSettings KeyVaultSettings;

    [Parameter] string KeyVaultBaseUrl;
    [Parameter] string KeyVaultClientId;
    [Parameter] string KeyVaultClientSecret;

    [KeyVaultSecret] string DocuApiEndpoint;
    [KeyVaultSecret("AvaCloudJavaScriptDemo-DocuApiKey")] string DocuApiKey;

    Target Clean => _ => _
        .Executes(() =>
        {
            EnsureCleanDirectory(OutputDirectory);
            DeleteFile(ZipPath);
        });

    Target BuildPage => _ => _
        .DependsOn(Clean)
        .Executes(() => {
            Npm("ci", SolutionDirectory);
            var endingsToCopy = new[]{".js", ".html", ".css", ".png", ".X86"};
            foreach (var file in System.IO.Directory.EnumerateFiles(SolutionDirectory).Where(path => endingsToCopy.Any(ending => path.EndsWith(ending))))
            {
                var fileName = System.IO.Path.GetFileName(file);
                CopyFile(file, OutputDirectory / fileName);
            }
            CopyDirectoryRecursively(SolutionDirectory / "dist", OutputDirectory / "dist");
        });

    Target Publish => _ => _
        .DependsOn(BuildPage)
        .Requires(() => DocuApiKey)
        .Requires(() => DocuApiEndpoint)
        .Executes(() => {
            WebDocu(s => s
                .SetDocuApiEndpoint(DocuApiEndpoint)
                .SetDocuApiKey(DocuApiKey)
                .SetSourceDirectory(OutputDirectory)
                .SetVersion(GitVersion.NuGetVersion));
        });
}
